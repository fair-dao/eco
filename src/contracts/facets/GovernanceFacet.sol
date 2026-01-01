// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "../storage/GovernanceStorage.sol";
import "../interfaces/IGovernanceFacet.sol";
import "../libraries/LibDiamond.sol";
import "../interfaces/IVoting.sol";
import "../interfaces/IDiamondCut.sol";

contract GovernanceFacet is GovernanceStorage, IGovernanceFacet, IDiamondCut {
    error Governance__ProposalDoesNotExist();
    error Governance__ProposalInvalidStatus();
    error Governance__VotingPeriodNotStarted();
    error Governance__VotingPeriodEnded();
    error Governance__AlreadyVoted();
    error Governance__InsufficientVotingPower();
    error Governance__InvalidVotingPeriod();
    error Governance__QuorumRequirementInvalid();
    error Governance__NotProposer();
    error Governance__CannotExecuteFailedProposal();
    error Governance__ExecutionDelayNotPassed();
    error Governance__ProposalAlreadyExecuted();
    error Governance__InvalidGovernanceTokenAddress();
    error Governance__InvalidFairStakeTokenAddress();
    error Governance__InvalidTargetAddress();
    error Governance__InvalidParameterValue();
    error Governance__AlreadyInitialized();
    error Governance__NoVotingPower();
    error Governance__ProposalNotReadyForExecution();
    error Governance__CallOnlyFromSelf();
    error Governance__OnlyProposalCreatorCanCancel();
    error Governance__CanOnlyCancelActiveProposals();
    error Governance__ProposalExecutionFailed();

    modifier onlyGovernance {
        LibDiamond.enforceIsDiamondCaller();
        _;
    }

    function diamondCut(IDiamondCut.FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external override {
        require(msg.sender == LibDiamond.contractOwner() || msg.sender == address(this), "GovernanceFacet: Not authorized");
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }

    function initializeGovernance(address _governanceTokenAddress) external {
        LibDiamond.enforceIsContractOwner();
        if (_governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress != address(0)) {
            revert Governance__AlreadyInitialized();
        }

        s.governanceTokenAddress = _governanceTokenAddress;
        s.minVotingPeriodBlocks = 100;
        s.maxVotingPeriodBlocks = 400000;
        s.proposalThreshold = 10000000 * 10**18;
        s.quorumNumerator = 10;
        s.quorumDenominator = 100;
        s.executionDelayBlocks = 100;
    }

    function getGovernanceTokenAddress() external view returns (address) {
        GovernanceStorageStruct storage s = getStorage();
        return s.governanceTokenAddress;
    }

    function createProposal(address target, bytes calldata data, string calldata description) external override returns (uint256 proposalId) {
        return _createProposal(target, data, description, 288000); // 10 days
    }

    function createDiamondCutProposal(
        IDiamondCut.FacetCut[] calldata _diamondCut,
        address init,
        bytes calldata initCalldata,
        string calldata description
    ) external override returns (uint256 proposalId) {
        bytes memory callData = abi.encodeWithSelector(
            IDiamondCut.diamondCut.selector,
            _diamondCut, init, initCalldata
        );
        proposalId = _createProposal(address(this), callData, description, 403200);  // 14 days
    }

    function updateProposalStatus(uint256 proposalId) public override {
        GovernanceStorageStruct storage s = getStorage();
        Proposal storage proposal = s.proposals[proposalId];
        
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        if (proposal.id != proposalId) {
            revert Governance__ProposalDoesNotExist();
        }
        
        _updateProposalStatus(s, proposal, proposalId);
    }

    function getProposal(uint256 proposalId) external view override returns (Proposal memory proposal) {
        GovernanceStorageStruct storage s = getStorage();
        proposal = s.proposals[proposalId];
        
        if (s.governanceTokenAddress != address(0) && proposal.id == proposalId) {
            Proposal memory tempProposal = proposal;
            
            if (tempProposal.status == ProposalStatus.Pending && block.number >= tempProposal.startBlock) {
                tempProposal.status = ProposalStatus.Active;
            }
            
            if (tempProposal.status == ProposalStatus.Active && block.number > tempProposal.endBlock) {
                uint256 totalVotes = tempProposal.forVotes + tempProposal.againstVotes + tempProposal.abstainVotes;
                IVoting votingContract = IVoting(s.governanceTokenAddress);
                uint256 totalAvailableVotes = votingContract.getAllVotes();
                uint256 quorumRequired = (totalAvailableVotes * s.quorumNumerator) / s.quorumDenominator;
                
                bool quorumMet = totalVotes >= quorumRequired;
                bool passes = tempProposal.forVotes > tempProposal.againstVotes;
                
                if (quorumMet && passes) {
                    tempProposal.status = ProposalStatus.Succeeded;
                } else {
                    tempProposal.status = ProposalStatus.Defeated;
                }
            }
            
            return tempProposal;
        }
        
        return proposal;
    }

    function getProposalCount() external view override returns (uint256 count) {
        GovernanceStorageStruct storage s = getStorage();
        return s.proposalCount;
    }

    function hasVoted(address voter, uint256 proposalId) external view returns (bool voted) {
        GovernanceStorageStruct storage s = getStorage();
        return s.voters[voter].hasVoted[proposalId];
    }

    function getVotingPower(address account) external view returns (uint256 votingPower) {
        return _getVotingPower(account);
    }

    function setVotingPeriodBlocks(uint256 minBlocks, uint256 maxBlocks) external override onlyGovernance {
        if (minBlocks < 100 || minBlocks > maxBlocks || maxBlocks > 430000) {
            revert Governance__InvalidParameterValue();
        }
        GovernanceStorageStruct storage s = getStorage();
        
        uint256 oldMinValue = s.minVotingPeriodBlocks;
        uint256 oldMaxValue = s.maxVotingPeriodBlocks;
        
        s.minVotingPeriodBlocks = minBlocks;
        s.maxVotingPeriodBlocks = maxBlocks;
        
        emit GovernanceParametersUpdated("minVotingPeriodBlocks", oldMinValue, minBlocks);
        emit GovernanceParametersUpdated("maxVotingPeriodBlocks", oldMaxValue, maxBlocks);
    }

    function setProposalThreshold(uint256 threshold) external override onlyGovernance {
        if (threshold == 0) {
            revert Governance__InvalidParameterValue();
        }
        GovernanceStorageStruct storage s = getStorage();
        uint256 oldValue = s.proposalThreshold;
        s.proposalThreshold = threshold;
        emit GovernanceParametersUpdated("proposalThreshold", oldValue, threshold);
    }

    function setQuorum(uint256 numerator, uint256 denominator) external override onlyGovernance {
        if (denominator == 0 || numerator > denominator || numerator == 0) {
            revert Governance__QuorumRequirementInvalid();
        }
        
        GovernanceStorageStruct storage s = getStorage();
        uint256 oldNumerator = s.quorumNumerator;
        uint256 oldDenominator = s.quorumDenominator;
        
        s.quorumNumerator = numerator;
        s.quorumDenominator = denominator;
        
        emit GovernanceParametersUpdated("quorumNumerator", oldNumerator, numerator);
        emit GovernanceParametersUpdated("quorumDenominator", oldDenominator, denominator);
    }

    /**
     * @dev Gets the quorum numerator and denominator
     * @return numerator Quorum numerator
     * @return denominator Quorum denominator
     */
    function getQuorum() external view override returns (uint256 numerator, uint256 denominator) {
        GovernanceStorageStruct storage s = getStorage();
        return (s.quorumNumerator, s.quorumDenominator);
    }
    
    function setExecutionDelayBlocks(uint256 blocks) external override onlyGovernance {
        if (blocks > 10000) {
            revert Governance__InvalidParameterValue();
        }
        GovernanceStorageStruct storage s = getStorage();
        uint256 oldValue = s.executionDelayBlocks;
        s.executionDelayBlocks = blocks;
        emit GovernanceParametersUpdated("executionDelayBlocks", oldValue, blocks);
    }

    function createSetVotingPeriodBlocksProposal(
        uint256 newMinVotingPeriodBlocks,
        uint256 newMaxVotingPeriodBlocks,
        string calldata proposalDescription
    ) external returns (uint256 newProposalId) {
        // 5 minutes - 14 days
        if (newMinVotingPeriodBlocks < 100 || newMinVotingPeriodBlocks > newMaxVotingPeriodBlocks || newMaxVotingPeriodBlocks > 430000) {
            revert Governance__InvalidParameterValue();
        }

        bytes memory callData = abi.encodeWithSelector(
            IGovernanceFacet.setVotingPeriodBlocks.selector,
            newMinVotingPeriodBlocks, newMaxVotingPeriodBlocks
        );
        
        return _createProposal(
            address(this),
            callData,
            proposalDescription,
            86400
        ); // 3 days
    }

    function createSetProposalThresholdProposal(
        uint256 newThreshold,
        string calldata proposalDescription
    ) external returns (uint256 newProposalId) {
        if (newThreshold == 0) {
            revert Governance__InvalidParameterValue();
        }

        bytes memory callData = abi.encodeWithSelector(
            IGovernanceFacet.setProposalThreshold.selector,
            newThreshold
        );
        
        return _createProposal(
            address(this),
            callData,
            proposalDescription,
            86400
        );
    }

    function createSetQuorumProposal(
        uint256 newNumerator,
        uint256 newDenominator,
        string calldata proposalDescription
    ) external returns (uint256 newProposalId) {
        if (newDenominator == 0 || newNumerator > newDenominator || newNumerator == 0) {
            revert Governance__QuorumRequirementInvalid();
        }

        bytes memory callData = abi.encodeWithSelector(
            IGovernanceFacet.setQuorum.selector,
            newNumerator, newDenominator
        );

        return _createProposal(
            address(this),
            callData,
            proposalDescription,
            86400
        );
    }

    function createSetExecutionDelayBlocksProposal(
        uint256 newExecutionDelayBlocks,
        string calldata proposalDescription
    ) external returns (uint256 newProposalId) {
        if (newExecutionDelayBlocks > 10000) {
            revert Governance__InvalidParameterValue();
        }

        bytes memory callData = abi.encodeWithSelector(
            IGovernanceFacet.setExecutionDelayBlocks.selector,
            newExecutionDelayBlocks
        );
        
        return _createProposal(
            address(this),
            callData,
            proposalDescription,
            86400
        );
    }

    function castVote(uint256 proposalId, bool support, bool abstain) external override {
        GovernanceStorageStruct storage s = getStorage();
        Proposal storage proposal = s.proposals[proposalId];
        
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        if (proposal.id != proposalId) {
            revert Governance__ProposalDoesNotExist();
        }

        updateProposalStatus(proposalId);
        
        if (proposal.status != ProposalStatus.Active) {
            revert Governance__ProposalInvalidStatus();
        }
        
        if (block.number < proposal.startBlock) {
            revert Governance__VotingPeriodNotStarted();
        }
        
        if (block.number > proposal.endBlock) {
            revert Governance__VotingPeriodEnded();
        }
        
        Voter storage voter = s.voters[msg.sender];
        if (voter.hasVoted[proposalId]) {
            revert Governance__AlreadyVoted();
        }
        
        uint256 votingPower = _getVotingPower(msg.sender);
        if (votingPower == 0) {
            revert Governance__NoVotingPower();
        }
        
        voter.hasVoted[proposalId] = true;
        voter.voteChoice[proposalId] = support;
        voter.hasAbstained[proposalId] = abstain;
        
        if (abstain) {
            proposal.abstainVotes += votingPower;
        } else if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(msg.sender, proposalId, support, abstain);
    }

    function executeProposal(uint256 proposalId) external override returns (bool success, bytes memory result) {
        GovernanceStorageStruct storage s = getStorage();
        Proposal storage proposal = s.proposals[proposalId];
        
        if (proposal.id != proposalId) {
            revert Governance__ProposalDoesNotExist();
        }
        
        updateProposalStatus(proposalId);
        
        if (proposal.status != ProposalStatus.Succeeded) {
            revert Governance__ProposalInvalidStatus();
        }
        
        if (proposal.executedAt != 0) {
            revert Governance__ProposalAlreadyExecuted();
        }
        
        if (block.number < proposal.endBlock + s.executionDelayBlocks) {
            revert Governance__ExecutionDelayNotPassed();
        }
        
        (success, result) = proposal.target.call(proposal.data);
        if (!success) {
            revert Governance__ProposalExecutionFailed();
        }
        
        proposal.status = ProposalStatus.Executed;
        proposal.executedAt = block.timestamp;
        
        emit ProposalExecuted(proposalId);
        emit ProposalStatusChanged(proposalId, ProposalStatus.Succeeded, ProposalStatus.Executed);
    }

    function cancelProposal(uint256 proposalId) external override {
        GovernanceStorageStruct storage s = getStorage();
        Proposal storage proposal = s.proposals[proposalId];
        
        if (proposal.id != proposalId) {
            revert Governance__ProposalDoesNotExist();
        }
        
        updateProposalStatus(proposalId);
        
        if (msg.sender != proposal.proposer) {
            revert Governance__OnlyProposalCreatorCanCancel();
        }
        
        if (proposal.status != ProposalStatus.Active) {
            revert Governance__CanOnlyCancelActiveProposals();
        }
        
        proposal.status = ProposalStatus.Canceled;
        
        emit ProposalCanceled(proposalId);
        emit ProposalStatusChanged(proposalId, ProposalStatus.Active, ProposalStatus.Canceled);
    }

    function _createProposal(address target, bytes memory data, string memory description, uint256 votingPeriodBlocks) internal returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();

        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        if (target == address(0)) {
            revert Governance__InvalidTargetAddress();
        }
        
        if (votingPeriodBlocks < s.minVotingPeriodBlocks || votingPeriodBlocks > s.maxVotingPeriodBlocks) {
            revert Governance__InvalidVotingPeriod();
        }

        uint256 votingPower = _getVotingPower(msg.sender);
        if (votingPower < s.proposalThreshold) {
            revert Governance__InsufficientVotingPower();
        }
        if( votingPower >= 30000000 * 10 ** 18){
            votingPeriodBlocks=  votingPeriodBlocks >> 4;
            if(votingPeriodBlocks< 200){
                votingPeriodBlocks=200;
            }
        }

        proposalId = s.proposalCount;
        s.proposalCount++;

        uint256 startBlock = block.number + 1;
        uint256 endBlock = startBlock + votingPeriodBlocks - 1;

        s.proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            target: target,
            data: data,
            description: description,
            startBlock: startBlock,
            endBlock: endBlock,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.Pending,
            createdAt: block.timestamp,
            executedAt: 0
        });

        emit ProposalCreated(proposalId, msg.sender, target, data, description, startBlock, endBlock);
    }

    function _getVotingPower(address account) internal view returns (uint256 votingPower) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        IVoting votingContract = IVoting(s.governanceTokenAddress);
        return votingContract.getUserVotes(account);
    }

    function _updateProposalStatus(
        GovernanceStorageStruct storage s, 
        Proposal storage proposal, 
        uint256 proposalId
    ) internal {
        if (proposal.status == ProposalStatus.Pending && block.number >= proposal.startBlock) {
            proposal.status = ProposalStatus.Active;
            emit ProposalStatusChanged(proposalId, ProposalStatus.Pending, ProposalStatus.Active);
        }
        
        if (proposal.status == ProposalStatus.Active && block.number > proposal.endBlock) {
            uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
            IVoting votingContract = IVoting(s.governanceTokenAddress);
            uint256 totalAvailableVotes = votingContract.getAllVotes();
            uint256 quorumRequired = (totalAvailableVotes * s.quorumNumerator) / s.quorumDenominator;
            
            bool quorumMet = totalVotes >= quorumRequired;
            bool passes = proposal.forVotes > proposal.againstVotes;
            
            if (quorumMet && passes) {
                proposal.status = ProposalStatus.Succeeded;
            } else {
                proposal.status = ProposalStatus.Defeated;
            }
            
            emit ProposalStatusChanged(proposalId, ProposalStatus.Active, proposal.status);
        }
    }
}


