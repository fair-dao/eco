// Governance Module
class GovernanceModule {
  static lastInstance = null;

  constructor() {
    GovernanceModule.lastInstance = this;

    // Get necessary modules from window
    this.tronWebConnector = window.tronWebConnector || null;
    this.contractInteraction = window.contractInteraction || null;
    this.common = window.fairStakeCommon || null;

    // Current account
    this.account = null;

    // DOM elements references
    this.domElements = {};

    // Currently selected proposal for voting
    this.currentVotingProposalId = null;

    // Proposals data cache
    this.proposals = [];
  }

  /**
   * Initialize the governance module
   */
  async init() {
    try {
      console.log("Initializing governance module...");

      // Initialize internationalization
      // 初始化多语言支持
      try {
        await this.i18n();
      } catch (ex) {
        console.log(ex);
      }

      // Initialize DOM references
      this.initDOMReferences();

      // Initialize event listeners
      this.initEventListeners();

      // Check if account is connected
      if (this.common && this.common.tronWebConnector.getAccount()) {
        this.account = this.common.tronWebConnector.getAccount();
        await this.loadGovernanceData();
        this.startDataRefreshTimer();
      }

      return true;
    } catch (error) {
      console.error("Governance module initialization error:", error);
      return false;
    }
  }

  /**
   * Initialize DOM elements references
   */
  initDOMReferences() {
    this.domElements = {
      // Create proposal elements
      proposalType: document.getElementById("proposalType"),
      dynamicFormFields: document.getElementById("dynamicFormFields"),
      proposalDescription: document.getElementById("proposalDescription"),
      createProposalBtn: document.getElementById("createProposalBtn"),

      // Create proposal modal elements
      createProposalModal: document.getElementById("createProposalModal"),
      openCreateProposalModalBtn: document.getElementById(
        "openCreateProposalModalBtn"
      ),
      closeCreateProposalModal: document.getElementById(
        "closeCreateProposalModal"
      ),
      cancelCreateProposalModal: document.getElementById(
        "cancelCreateProposalModal"
      ),

      // Proposals list elements
      proposalStatusFilter: document.getElementById("proposalStatusFilter"),
      proposalsList: document.getElementById("proposalsList"),

      // Voting info elements
      votingPower: document.getElementById("votingPower"),
      quorumInfo: document.getElementById("quorumInfo"),

      // Refresh button
      refreshGovernanceStatsBtn: document.getElementById(
        "refreshGovernanceStatsBtn"
      ),

      // Modal elements
      voteModal: document.getElementById("voteModal"),
      closeVoteModal: document.getElementById("closeVoteModal"),
      cancelVoteModal: document.getElementById("cancelVoteModal"),
      confirmVote: document.getElementById("confirmVote"),
    };
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Open create proposal modal button click event
    if (this.domElements.openCreateProposalModalBtn) {
      this.domElements.openCreateProposalModalBtn.addEventListener(
        "click",
        () => this.openCreateProposalModal()
      );
    }

    // Create proposal button click event
    if (this.domElements.createProposalBtn) {
      this.domElements.createProposalBtn.addEventListener("click", () =>
        this.handleCreateProposal()
      );
    }

    // Proposal description input event (to enable/disable create button)
    if (this.domElements.proposalDescription) {
      this.domElements.proposalDescription.addEventListener("input", () => {
        this.updateCreateProposalButtonState();
      });
    }

    // Create proposal modal close events
    if (this.domElements.closeCreateProposalModal) {
      this.domElements.closeCreateProposalModal.addEventListener("click", () =>
        this.closeCreateProposalModal()
      );
    }

    if (this.domElements.cancelCreateProposalModal) {
      this.domElements.cancelCreateProposalModal.addEventListener("click", () =>
        this.closeCreateProposalModal()
      );
    }

    // Close create proposal modal when clicking outside
    if (this.domElements.createProposalModal) {
      this.domElements.createProposalModal.addEventListener("click", (e) => {
        if (e.target === this.domElements.createProposalModal) {
          this.closeCreateProposalModal();
        }
      });
    }

    // Proposal status filter change event
    if (this.domElements.proposalStatusFilter) {
      this.domElements.proposalStatusFilter.addEventListener("change", () => {
        this.filterProposals();
      });
    }

    // Refresh button click event
    if (this.domElements.refreshGovernanceStatsBtn) {
      this.domElements.refreshGovernanceStatsBtn.addEventListener(
        "click",
        async () => {
          await this.loadGovernanceData();
        }
      );
    }

    // Modal close events
    if (this.domElements.closeVoteModal) {
      this.domElements.closeVoteModal.addEventListener("click", () =>
        this.closeVoteModal()
      );
    }

    if (this.domElements.cancelVoteModal) {
      this.domElements.cancelVoteModal.addEventListener("click", () =>
        this.closeVoteModal()
      );
    }

    // Vote confirmation event
    if (this.domElements.confirmVote) {
      this.domElements.confirmVote.addEventListener("click", () =>
        this.handleVote()
      );
    }

    // Close modal when clicking outside
    if (this.domElements.voteModal) {
      this.domElements.voteModal.addEventListener("click", (e) => {
        if (e.target === this.domElements.voteModal) {
          this.closeVoteModal();
        }
      });
    }

    // Add event delegation for vote buttons (since they're dynamically created)
    if (this.domElements.proposalsList) {
      this.domElements.proposalsList.addEventListener("click", (e) => {
        const voteBtn = e.target.closest(".vote-btn");
        if (voteBtn) {
          const proposalId = parseInt(voteBtn.getAttribute("data-proposal-id"));
          this.handleVoteButtonClick(proposalId);
        }
      });
    }

    // Proposal type change event - update dynamic form fields
    if (this.domElements.proposalType) {
      this.domElements.proposalType.addEventListener("change", () => {
        this.updateDynamicFormFields();
      });
    }
  }

  /**
   * Load governance data
   */
  async loadGovernanceData() {
    try {
      // Show loading state on refresh button
      if (this.domElements.refreshGovernanceStatsBtn) {
        const icon =
          this.domElements.refreshGovernanceStatsBtn.querySelector("i");
        if (icon) {
          icon.classList.add("fa-spin");
        }
      }

      // Check if account is connected
      if (!this.account) {
        if (this.common && this.common.tronWebConnector) {
          this.account = this.common.tronWebConnector.getAccount();
        }
        if (!this.account) {
          if (this.common) {
            const tConnectWallet =
              this.i18nData["governance.messages.connectWallet"] ||
              "Please connect your wallet first.";
            this.common.showMessage("warning", tConnectWallet);
          }
          return;
        }
      }

      // Check if contract interaction module is initialized
      if (
        !this.contractInteraction ||
        typeof this.contractInteraction.isInitialized !== "function" ||
        !this.contractInteraction.isInitialized()
      ) {
        console.error("Contract interaction module not initialized");
        return;
      }

      // Load voting power
      await this.loadVotingPower();

      // Load quorum information
      await this.loadQuorumInfo();

      // Load proposals list
      await this.loadProposals();

      // Enable create proposal button if conditions are met
      this.updateCreateProposalButtonState();
    } catch (error) {
      console.error("Loading governance data error:", error);
      if (this.common) {
        const tLoadFailed =
          this.i18nData["governance.messages.loadFailed"] ||
          "Failed to load governance data.";
        this.common.showMessage("error", tLoadFailed);
      }
    } finally {
      // Hide loading state on refresh button
      if (this.domElements.refreshGovernanceStatsBtn) {
        const icon =
          this.domElements.refreshGovernanceStatsBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-spin");
        }
      }
    }
  }

  /**
   * Load user's voting power
   */
  async loadVotingPower() {
    try {
      const diamondContract = await this.common.getDiamondContract();
      const votingPower = await diamondContract
        .getVotingPower(this.account)
        .call();

      if (votingPower && this.domElements.votingPower) {
        this.domElements.votingPower.value = votingPower.toString() || "0";
      }
    } catch (error) {
      console.error("Loading voting power error:", error);
    }
  }

  /**
   * Load quorum information
   */
  async loadQuorumInfo() {
    try {
      /*
      const diamondContract = await this.common.getDiamondContract();
      
      const quorumInfo = await diamondContract.getQuorumInfo().call();
      
      if (quorumInfo && this.domElements.quorumInfo) {
        const quorumPercent = (quorumInfo.numerator / quorumInfo.denominator * 100).toFixed(2);
        this.domElements.quorumInfo.value = `${quorumPercent}% of total voting power`;
      }*/
    } catch (error) {
      console.error("Loading quorum info error:", error);
    }
  }

  /**
   * Load all proposals
   */
  async loadProposals() {
    try {
      const diamondContract = await this.common.getDiamondContract();
      const proposals = await diamondContract.getAllProposals().call();

      if (proposals) {
        this.proposals = proposals;
        this.renderProposals();
      }
    } catch (error) {
      console.error("Loading proposals error:", error);
    }
  }

  /**
   * Render proposals list
   */
  async renderProposals() {
    if (!this.domElements.proposalsList) return;

    // Filter proposals based on selected status
    const filterStatus = this.domElements.proposalStatusFilter
      ? this.domElements.proposalStatusFilter.value
      : "all";
    let filteredProposals = this.proposals;

    if (filterStatus !== "all") {
      filteredProposals = this.proposals.filter(
        (proposal) =>
          proposal.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Clear existing proposals
    this.domElements.proposalsList.innerHTML = "";

    if (filteredProposals.length === 0) {
      const tNoProposals =
        this.i18nData["governance.messages.noProposals"] ||
        "No proposals found.";
      this.domElements.proposalsList.innerHTML = `<div class="notification is-light"><p>${tNoProposals}</p></div>`;
      return;
    }
    const tronWeb = this.common.tronWebConnector.getReadTronWeb();
    const block = await tronWeb.trx.getCurrentBlock();
    const currentBlockNumber = block.block_header.raw_data.number;

    // Create proposals cards
    for (let i = 0; i < filteredProposals.length; i++) {
      const proposal = filteredProposals[i];
      if (proposal.endBlock > currentBlockNumber) {
         proposal.endTime= this.formatDate( (Date.now()+ (proposal.endBlock - currentBlockNumber)*3000));
      }
      const proposalCard = await this.createProposalCard(proposal);
      this.domElements.proposalsList.appendChild(proposalCard);
    }
    this.domElements.proposalsList
      .querySelectorAll(".execute-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const proposalId = btn.dataset.proposalId;
          this.executeProposal(proposalId);
        });
      });
  }

  /**
   * Execute a proposal
   */
  async executeProposal(proposalId) {
    try {
      // Get translations
      const tExecuted =
        this.i18nData["governance.messages.executed"] ||
        "Proposal executed successfully!";
      const tExecuteFailed =
        this.i18nData["governance.messages.executeFailed"] ||
        "Failed to execute proposal";

      const diamondContract = await this.common.getDiamondContract();
      await diamondContract.executeProposal(proposalId).send({
        from: this.account,
      });
      this.common.showMessage("success", tExecuted);
      this.loadProposals();
    } catch (error) {
      console.error("Executing proposal error:", error);
      const tExecuteFailed =
        this.i18nData["governance.messages.executeFailed"] ||
        "Failed to execute proposal";
      this.common.showMessage("error", tExecuteFailed);
    }
  }

  /**
   * Format date for older browser compatibility
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);

    // Format date components
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);

    // Create a compatible date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }


  /**
   * Create a proposal card element
   */
  async createProposalCard(proposal) {
    const card = document.createElement("div");
    card.className = "card mb-4";

    // Status badge color mapping
    const statusColors = {
      pending: "is-warning",
      active: "is-info",
      succeeded: "is-success",
      defeated: "is-danger",
      executed: "is-dark",
      canceled: "is-light",
    };

    // Get translated status text
    const statusKey = `governance.status.${proposal.status.toLowerCase()}`;
    const statusText = this.i18nData[statusKey] || proposal.status;

    const statusColor =
      statusColors[proposal.status.toLowerCase()] || "is-light";

    // Get vote status
    const actions = await this.createProposalActions(proposal);

    // Truncate address if common module is available
    let truncatedAddress = proposal.proposer;
    if (this.common && typeof this.common.truncateAddress === "function") {
      truncatedAddress = this.common.truncateAddress(window.TronWeb.utils.address.fromHex(proposal.proposer));
    }

    // Get translations
    const tProposal = this.i18nData["governance.card.proposal"] || "Proposal";
    const tDescription =
      this.i18nData["governance.card.description"] || "Description";
    const tNoDescription =
      this.i18nData["governance.card.noDescription"] || "No description";
    const tProposer = this.i18nData["governance.card.proposer"] || "Proposer";
    const tCreated = this.i18nData["governance.card.created"] || "Created";
    const tVotingEndTime = this.i18nData["governance.card.votingEndTime"] || "Voting Ends";
    const tVotes = this.i18nData["governance.card.votes"] || "Votes";
    const tFor = this.i18nData["governance.card.for"] || "For";
    const tAgainst = this.i18nData["governance.card.against"] || "Against";
    const tAbstain = this.i18nData["governance.card.abstain"] || "Abstain";

    // Calculate voting end time if endBlock is available
    let votingEndTimeDisplay = "";
    if (proposal.endTime) {
      votingEndTimeDisplay = `<p><strong>${tVotingEndTime}:</strong> ${proposal.endTime}</p>`;
    }

    card.innerHTML = `
      <div class="card-header">
        <p class="card-header-title">
          ${tProposal} #${proposal.id} - ${statusText}
        </p>
        <div class="card-header-icon">
          <span class="tag ${statusColor}">${statusText}</span>
        </div>
      </div>
      <div class="card-content">
        <div class="content">
          <p><strong>${tDescription}:</strong> ${
      proposal.description || tNoDescription
    }</p>
          <p><strong>${tProposer}:</strong> ${truncatedAddress}</p>
          <p><strong>${tCreated}:</strong> ${this.formatDate(
      proposal.createdAt*1000
    )}</p>
          ${votingEndTimeDisplay}
          
          <div class="mt-3">
            <p><strong>${tVotes}:</strong></p>
            <div class="columns">
              <div class="column">
                <div class="notification is-success">
                  <strong>${tFor}:</strong> ${proposal.forVotes || 0}
                </div>
              </div>
              <div class="column">
                <div class="notification is-danger">
                  <strong>${tAgainst}:</strong> ${proposal.againstVotes || 0}
                </div>
              </div>
              <div class="column">
                <div class="notification is-light">
                  <strong>${tAbstain}:</strong> ${proposal.abstainVotes || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <div class="field is-grouped">
            ${actions}
          </div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Create proposal action buttons based on status and user permissions
   */
  async createProposalActions(proposal) {
    // Check if user can vote
    const state = proposal.status.toLowerCase();
    const canVote = proposal.status.toLowerCase() === "active";

    // Check if user has already voted

    // Get translations
    const tWaitingActivation =
      this.i18nData["governance.actions.waitingActivation"] ||
      "Waiting for Activation";
    const tVote = this.i18nData["governance.actions.vote"] || "Vote";
    const tAlreadyVoted =
      this.i18nData["governance.actions.alreadyVoted"] || "Already Voted";
    const tExecute = this.i18nData["governance.actions.execute"] || "Execute";

    let actions = "";
    switch (state) {
      case "pending":
        actions = `
          <div class="control">
            <button class="button is-primary" disabled>
              <i class="fas fa-check-circle mr-1"></i>${tWaitingActivation}</button>
          </div>
        `;
        break;
      case "active":
        let hasVoted = false;
        if (this.account && this.contractInteraction) {
          hasVoted = await this.contractInteraction.hasVoted(
            this.account,
            proposal.id
          );
        }
        if (!hasVoted) {
          actions = `
          <div class="control">
            <button class="button is-primary vote-btn" data-proposal-id="${proposal.id}">
              <i class="fas fa-check-circle mr-1"></i>${tVote}
            </button>
          </div>
        `;
        } else {
          actions = `
          <div class="control">
            <button class="button is-light" disabled>
            <i class="fas fa-check mr-1"></i>${tAlreadyVoted}
          </button>
        </div>
      `;
        }
        break;

      case "succeeded":
        actions = `
          <div class="control">
            <button class="button is-light execute-btn"  data-proposal-id="${proposal.id}">
            <i class="fas fa-check mr-1"></i>${tExecute}</button>
        </div>
      `;
      case "defeated":
      case "executed":
      case "canceled":
    }

    return actions;
  }

  /**
   * Filter proposals based on selected status
   */
  async filterProposals() {
    await this.renderProposals();
  }

  /**
   * Load all proposals
   */
  async loadProposals() {
    try {
      if (!this.contractInteraction) return;

      const result = await this.contractInteraction.getAllProposals();

      if (result.success) {
        this.proposals = result.proposals;
        await this.renderProposals();
      }
    } catch (error) {
      console.error("Loading proposals error:", error);
    }
  }

  /**
   * Handle create proposal button click
   */
  async handleCreateProposal() {
    try {
      // Get translations
      const tConnectWallet =
        this.i18nData["governance.messages.connectWallet"] ||
        "Please connect your wallet first.";
      const tEnterDescription =
        this.i18nData["governance.messages.enterDescription"] ||
        "Please enter a proposal description.";
      const tProposalCreated =
        this.i18nData["governance.messages.proposalCreated"] ||
        "Proposal created successfully!";
      const tCreateFailed =
        this.i18nData["governance.messages.createFailed"] ||
        "Failed to create proposal";
      const tUnknownError =
        this.i18nData["governance.messages.unknownError"] || "Unknown error";
      const tCreating =
        this.i18nData["governance.actions.creating"] || "Creating...";
      const tCreateProposal =
        this.i18nData["governance.actions.createProposal"] || "Create Proposal";

      if (!this.account || !this.contractInteraction) {
        if (this.common) {
          this.common.showMessage("warning", tConnectWallet);
        }
        return;
      }

      // Get proposal type
      const proposalType = this.domElements.proposalType
        ? this.domElements.proposalType.value
        : "text";

      const description = this.domElements.proposalDescription
        ? this.domElements.proposalDescription.value.trim()
        : "";

      if (!description) {
        if (this.common) {
          this.common.showMessage("warning", tEnterDescription);
        }
        return;
      }

      // Collect dynamic form data
      const proposalData = this.collectProposalFormData(proposalType);

      // Show loading state
      if (this.domElements.createProposalBtn) {
        this.domElements.createProposalBtn.disabled = true;
        this.domElements.createProposalBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>${tCreating}`;
      }

      // Call contract to create proposal with type and data
      const result = await this.contractInteraction.createProposal(
        description,
        proposalType,
        proposalData
      );

      if (result.success) {
        if (this.common) {
          this.common.showMessage("success", tProposalCreated);
        }

        // Close the modal
        this.closeCreateProposalModal();

        // Refresh proposals list
        await this.loadGovernanceData();
      } else {
        if (this.common) {
          this.common.showMessage(
            "error",
            `${tCreateFailed}: ${result.error || tUnknownError}`
          );
        }
      }
    } catch (error) {
      console.error("Create proposal error:", error);
      if (this.common) {
        const tCreateFailed =
          this.i18nData["governance.messages.createFailed"] ||
          "Failed to create proposal";
        const tUnknownError =
          this.i18nData["governance.messages.unknownError"] || "Unknown error";
        this.common.showMessage(
          "error",
          `${tCreateFailed}: ${error.message || tUnknownError}`
        );
      }
    } finally {
      // Reset button state
      if (this.domElements.createProposalBtn) {
        this.domElements.createProposalBtn.disabled = false;
        const tCreateProposal =
          this.i18nData["governance.actions.createProposal"] ||
          "Create Proposal";
        this.domElements.createProposalBtn.innerHTML = `<i class="fas fa-file-alt mr-1"></i>${tCreateProposal}`;
      }
    }
  }

  /**
   * Collect form data based on proposal type
   */
  collectProposalFormData(proposalType) {
    const data = {};

    switch (proposalType) {
      case "setTokenExchangeRate":
        data.tokenAddress =
          document.getElementById("tokenAddress")?.value || "";
        data.rateNumerator =
          document.getElementById("rateNumerator")?.value || "0";
        data.rateDenominator =
          document.getElementById("rateDenominator")?.value || "0";
        data.maxExchangeAmount =
          document.getElementById("maxExchangeAmount")?.value || "0";
        data.transferType =
          document.getElementById("transferType")?.value || "0";
        data.durationWeeks =
          document.getElementById("durationWeeks")?.value || "0";
        break;
      case "mintContributorReward":
        data.contributor = document.getElementById("contributor")?.value || "";
        data.amount = document.getElementById("amount")?.value || "0";
        data.descriptionOfReward =
          document.getElementById("descriptionOfReward")?.value || "";
        break;
      case "pause":
      case "unpause":
        // No additional data for pause/unpause
        break;
      case "pauseModule":
      case "unpauseModule":
        data.module = document.getElementById("module")?.value || "0";
        break;
      case "setVotingPeriod":
        data.minVotingPeriod =
          document.getElementById("minVotingPeriod")?.value || "0";
        data.maxVotingPeriod =
          document.getElementById("maxVotingPeriod")?.value || "0";
        break;
      case "setProposalThreshold":
        data.threshold = document.getElementById("threshold")?.value || "0";
        break;
      case "setQuorum":
        data.quorumNumerator =
          document.getElementById("quorumNumerator")?.value || "0";
        data.quorumDenominator =
          document.getElementById("quorumDenominator")?.value || "0";
        break;
      case "setExecutionDelay":
        data.executionDelay =
          document.getElementById("executionDelay")?.value || "0";
        break;
      case "createProposal":
        data.target = document.getElementById("target")?.value || "";
        data.data = document.getElementById("data")?.value || "";
        data.votingPeriodBlocks =
          document.getElementById("votingPeriodBlocks")?.value || "0";
        break;
      case "createDiamondCutProposal":
        data.diamondCut = document.getElementById("diamondCut")?.value || "";
        data.init = document.getElementById("init")?.value || "";
        data.initCalldata =
          document.getElementById("initCalldata")?.value || "";
        data.votingPeriodBlocks =
          document.getElementById("votingPeriodBlocks")?.value || "0";
        break;
      default:
        // No additional data for unknown proposal types
        break;
    }

    return data;
  }

  handleVoteButtonClick(proposalId) {
    this.currentVotingProposalId = proposalId;
    this.openVoteModal();
  }

  /**
   * Open vote modal
   */
  openVoteModal() {
    if (this.domElements.voteModal) {
      this.domElements.voteModal.classList.add("is-active");
    }
  }

  /**
   * Close vote modal
   */
  closeVoteModal() {
    if (this.domElements.voteModal) {
      this.domElements.voteModal.classList.remove("is-active");
    }
    this.currentVotingProposalId = null;
  }

  /**
   * Handle vote submission
   */
  async handleVote() {
    try {
      // Get translations
      const tVoteCast =
        this.i18nData["governance.messages.voteCast"] ||
        "Vote cast successfully!";
      const tVoteFailed =
        this.i18nData["governance.messages.voteFailed"] ||
        "Failed to cast vote";
      const tUnknownError =
        this.i18nData["governance.messages.unknownError"] || "Unknown error";
      const tVoting = this.i18nData["governance.actions.voting"] || "Voting...";
      const tConfirmVote =
        this.i18nData["governance.actions.confirmVote"] || "Confirm Vote";     

      // Get selected vote choice
      const voteChoice = document.querySelector(
        'input[name="voteChoice"]:checked'
      ).value;

      // Show loading state
      if (this.domElements.confirmVote) {
        this.domElements.confirmVote.disabled = true;
        this.domElements.confirmVote.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>${tVoting}`;
      }

      // Call contract to cast vote
      const result = await this.contractInteraction.castVote(
        this.currentVotingProposalId,
        voteChoice
      );

      if (result.success) {
        if (this.common) {
          this.common.showMessage("success", tVoteCast);
        }
        this.closeVoteModal();
        await this.loadGovernanceData();
      } else {
        if (this.common) {
          this.common.showMessage(
            "error",
            `${tVoteFailed}: ${result.error || tUnknownError}`
          );
        }
      }
    } catch (error) {
      console.error("Vote error:", error);
      if (this.common) {
        const tVoteFailed =
          this.i18nData["governance.messages.voteFailed"] ||
          "Failed to cast vote";
        const tUnknownError =
          this.i18nData["governance.messages.unknownError"] || "Unknown error";
        this.common.showMessage(
          "error",
          `${tVoteFailed}: ${error.message || tUnknownError}`
        );
      }
    } finally {
      // Reset button state
      if (this.domElements.confirmVote) {
        this.domElements.confirmVote.disabled = false;
        const tConfirmVote =
          this.i18nData["governance.actions.confirmVote"] || "Confirm Vote";
        this.domElements.confirmVote.innerHTML = tConfirmVote;
      }
    }
  }

  /**
   * Update dynamic form fields based on selected proposal type
   */
  updateDynamicFormFields() {
    const proposalType = this.domElements.proposalType.value;
    // For setTokenExchangeRate, load the dedicated module
    if (proposalType === "setTokenExchangeRate") {
      this.closeCreateProposalModal();
      if (window.fairdao) {
        window.fairdao.loadModule("governance", "setTokenExchangeRate");
      }
      return;
    }

    const container = this.domElements.dynamicFormFields;
    container.innerHTML = "";

    const translator = this.translator;

    const formFields = {
      setTokenExchangeRate: [
        {
          id: "tokenAddress",
          type: "text",
          label: translator.translate("governance.formFields.tokenAddress"),
          placeholder: translator.translate(
            "governance.placeholders.tokenAddress"
          ),
        },
        {
          id: "rateNumerator",
          type: "number",
          label: translator.translate("governance.formFields.rateNumerator"),
          placeholder: translator.translate(
            "governance.placeholders.rateNumerator"
          ),
        },
        {
          id: "rateDenominator",
          type: "number",
          label: translator.translate("governance.formFields.rateDenominator"),
          placeholder: translator.translate(
            "governance.placeholders.rateDenominator"
          ),
        },
        {
          id: "maxExchangeAmount",
          type: "number",
          label: translator.translate(
            "governance.formFields.maxExchangeAmount"
          ),
          placeholder: translator.translate(
            "governance.placeholders.maxExchangeAmount"
          ),
        },
        {
          id: "transferType",
          type: "number",
          label: translator.translate("governance.formFields.transferType"),
          placeholder: translator.translate(
            "governance.placeholders.transferType"
          ),
        },
        {
          id: "durationWeeks",
          type: "number",
          label: translator.translate("governance.formFields.durationWeeks"),
          placeholder: translator.translate(
            "governance.placeholders.durationWeeks"
          ),
        },
      ],
      mintContributorReward: [
        {
          id: "contributor",
          type: "text",
          label: translator.translate("governance.formFields.contributor"),
          placeholder: translator.translate(
            "governance.placeholders.contributor"
          ),
        },
        {
          id: "amount",
          type: "number",
          label: translator.translate("governance.formFields.amount"),
          placeholder: translator.translate("governance.placeholders.amount"),
        },
        {
          id: "descriptionOfReward",
          type: "text",
          label: translator.translate(
            "governance.formFields.descriptionOfReward"
          ),
          placeholder: translator.translate(
            "governance.placeholders.descriptionOfReward"
          ),
        },
      ],
      pause: [],
      unpause: [],
      pauseModule: [
        {
          id: "module",
          type: "number",
          label: translator.translate("governance.formFields.module"),
          placeholder: translator.translate("governance.placeholders.module"),
        },
      ],
      unpauseModule: [
        {
          id: "module",
          type: "number",
          label: translator.translate("governance.formFields.module"),
          placeholder: translator.translate("governance.placeholders.module"),
        },
      ],
      setVotingPeriod: [
        {
          id: "minVotingPeriod",
          type: "number",
          label: translator.translate("governance.formFields.minVotingPeriod"),
          placeholder: translator.translate(
            "governance.placeholders.minVotingPeriod"
          ),
        },
        {
          id: "maxVotingPeriod",
          type: "number",
          label: translator.translate("governance.formFields.maxVotingPeriod"),
          placeholder: translator.translate(
            "governance.placeholders.maxVotingPeriod"
          ),
        },
      ],
      setProposalThreshold: [
        {
          id: "threshold",
          type: "number",
          label: translator.translate("governance.formFields.threshold"),
          placeholder: translator.translate(
            "governance.placeholders.threshold"
          ),
        },
      ],
      setQuorum: [
        {
          id: "quorumNumerator",
          type: "number",
          label: translator.translate("governance.formFields.quorumNumerator"),
          placeholder: translator.translate(
            "governance.placeholders.quorumNumerator"
          ),
        },
        {
          id: "quorumDenominator",
          type: "number",
          label: translator.translate(
            "governance.formFields.quorumDenominator"
          ),
          placeholder: translator.translate(
            "governance.placeholders.quorumDenominator"
          ),
        },
      ],
      setExecutionDelay: [
        {
          id: "executionDelay",
          type: "number",
          label: translator.translate("governance.formFields.executionDelay"),
          placeholder: translator.translate(
            "governance.placeholders.executionDelay"
          ),
        },
      ],
      createProposal: [
        {
          id: "target",
          type: "text",
          label: translator.translate("governance.formFields.target"),
          placeholder: translator.translate("governance.placeholders.target"),
        },
        {
          id: "data",
          type: "textarea",
          label: translator.translate("governance.formFields.data"),
          placeholder: translator.translate("governance.placeholders.data"),
        },
        {
          id: "votingPeriodBlocks",
          type: "number",
          label: translator.translate(
            "governance.formFields.votingPeriodBlocks"
          ),
          placeholder: translator.translate(
            "governance.placeholders.votingPeriodBlocks"
          ),
        },
      ],
      createDiamondCutProposal: [
        {
          id: "diamondCut",
          type: "textarea",
          label: translator.translate("governance.formFields.diamondCut"),
          placeholder: translator.translate(
            "governance.placeholders.diamondCut"
          ),
        },
        {
          id: "init",
          type: "text",
          label: translator.translate("governance.formFields.init"),
          placeholder: translator.translate("governance.placeholders.init"),
        },
        {
          id: "initCalldata",
          type: "textarea",
          label: translator.translate("governance.formFields.initCalldata"),
          placeholder: translator.translate(
            "governance.placeholders.initCalldata"
          ),
        },
        {
          id: "votingPeriodBlocks",
          type: "number",
          label: translator.translate(
            "governance.formFields.votingPeriodBlocks"
          ),
          placeholder: translator.translate(
            "governance.placeholders.votingPeriodBlocks"
          ),
        },
      ],
    };

    const fields = formFields[proposalType] || [];
    fields.forEach((field) => {
      const fieldHtml = `
        <div class="field">
          <label class="label">${field.label}</label>
          <div class="control">
            <input id="${field.id}" type="${field.type}" class="input" placeholder="${field.placeholder}" />
          </div>
        </div>
      `;
      container.innerHTML += fieldHtml;
    });
  }

  /**
   * Open create proposal modal
   */
  openCreateProposalModal() {
    if (this.domElements.createProposalModal) {
      this.domElements.createProposalModal.classList.add("is-active");
    }
    // Initialize dynamic form fields
    this.updateDynamicFormFields();
  }

  closeCreateProposalModal() {
    if (this.domElements.createProposalModal) {
      this.domElements.createProposalModal.classList.remove("is-active");
    }
    // Clear the proposal description
    if (this.domElements.proposalDescription) {
      this.domElements.proposalDescription.value = "";
    }
    // Update button state
    this.updateCreateProposalButtonState();
  }

  /**
   * Update create proposal button state
   */
  updateCreateProposalButtonState() {
    if (
      !this.domElements.createProposalBtn ||
      !this.domElements.proposalDescription
    ) {
      return;
    }

    const hasDescription =
      this.domElements.proposalDescription.value.trim().length > 0;
    const isConnected = this.account !== null;

    this.domElements.createProposalBtn.disabled = !(
      hasDescription && isConnected
    );
  }

  /**
   * Start timer for periodic data refresh
   */
  startDataRefreshTimer(time = 100) {
    const me = this;
    setTimeout(async () => {
      try {
        if (GovernanceModule.lastInstance === me) {
          await this.loadGovernanceData();
        }
      } catch (error) {
        console.error("Periodic data refresh error:", error);
      }
      me.startDataRefreshTimer(60000);
    }, time);
  }
}

export default GovernanceModule;

function updateDynamicFormFields(proposalType) {
  const dynamicFields = document.getElementById("dynamicFormFields");
  const i18nData = i18n[currentLanguage];

  let fieldsHTML = "";

  switch (proposalType) {
    case "setTokenExchangeRate":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.tokenAddress">${i18nData["governance.formFields.tokenAddress"]}</label>
          <input type="text" id="tokenAddress" class="form-control" placeholder="${i18nData["governance.placeholders.tokenAddress"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.rateNumerator">${i18nData["governance.formFields.rateNumerator"]}</label>
          <input type="number" id="rateNumerator" class="form-control" placeholder="${i18nData["governance.placeholders.rateNumerator"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.rateDenominator">${i18nData["governance.formFields.rateDenominator"]}</label>
          <input type="number" id="rateDenominator" class="form-control" placeholder="${i18nData["governance.placeholders.rateDenominator"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.maxExchangeAmount">${i18nData["governance.formFields.maxExchangeAmount"]}</label>
          <input type="number" id="maxExchangeAmount" class="form-control" placeholder="${i18nData["governance.placeholders.maxExchangeAmount"]}" required>
        </div>
      `;
      break;

    case "mintContributorReward":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.contributor">${i18nData["governance.formFields.contributor"]}</label>
          <input type="text" id="contributor" class="form-control" placeholder="${i18nData["governance.placeholders.contributor"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.amount">${i18nData["governance.formFields.amount"]}</label>
          <input type="number" id="amount" class="form-control" placeholder="${i18nData["governance.placeholders.amount"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.descriptionOfReward">${i18nData["governance.formFields.descriptionOfReward"]}</label>
          <input type="text" id="descriptionOfReward" class="form-control" placeholder="${i18nData["governance.placeholders.descriptionOfReward"]}" required>
        </div>
      `;
      break;

    case "pause":
    case "unpause":
      fieldsHTML = "";
      break;

    case "pauseModule":
    case "unpauseModule":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.module">${i18nData["governance.formFields.module"]}</label>
          <input type="number" id="module" class="form-control" placeholder="${i18nData["governance.placeholders.module"]}" required>
        </div>
      `;
      break;

    case "setVotingPeriod":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.minVotingPeriod">${i18nData["governance.formFields.minVotingPeriod"]}</label>
          <input type="number" id="minVotingPeriod" class="form-control" placeholder="${i18nData["governance.placeholders.minVotingPeriod"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.maxVotingPeriod">${i18nData["governance.formFields.maxVotingPeriod"]}</label>
          <input type="number" id="maxVotingPeriod" class="form-control" placeholder="${i18nData["governance.placeholders.maxVotingPeriod"]}" required>
        </div>
      `;
      break;

    case "setProposalThreshold":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.threshold">${i18nData["governance.formFields.threshold"]}</label>
          <input type="number" id="threshold" class="form-control" placeholder="${i18nData["governance.placeholders.threshold"]}" required>
        </div>
      `;
      break;

    case "setQuorum":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.quorumNumerator">${i18nData["governance.formFields.quorumNumerator"]}</label>
          <input type="number" id="quorumNumerator" class="form-control" placeholder="${i18nData["governance.placeholders.quorumNumerator"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.quorumDenominator">${i18nData["governance.formFields.quorumDenominator"]}</label>
          <input type="number" id="quorumDenominator" class="form-control" placeholder="${i18nData["governance.placeholders.quorumDenominator"]}" required>
        </div>
      `;
      break;

    case "setExecutionDelay":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.executionDelay">${i18nData["governance.formFields.executionDelay"]}</label>
          <input type="number" id="executionDelay" class="form-control" placeholder="${i18nData["governance.placeholders.executionDelay"]}" required>
        </div>
      `;
      break;

    case "createProposal":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.target">${i18nData["governance.formFields.target"]}</label>
          <input type="text" id="target" class="form-control" placeholder="${i18nData["governance.placeholders.target"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.data">${i18nData["governance.formFields.data"]}</label>
          <textarea id="data" class="form-control" rows="3" placeholder="${i18nData["governance.placeholders.data"]}" required></textarea>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.votingPeriodBlocks">${i18nData["governance.formFields.votingPeriodBlocks"]}</label>
          <input type="number" id="votingPeriodBlocks" class="form-control" placeholder="${i18nData["governance.placeholders.votingPeriodBlocks"]}" required>
        </div>
      `;
      break;

    case "createDiamondCutProposal":
      fieldsHTML = `
        <div class="form-group">
          <label data-i18n="governance.formFields.diamondCut">${i18nData["governance.formFields.diamondCut"]}</label>
          <textarea id="diamondCut" class="form-control" rows="5" placeholder="${i18nData["governance.placeholders.diamondCut"]}" required></textarea>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.init">${i18nData["governance.formFields.init"]}</label>
          <input type="text" id="init" class="form-control" placeholder="${i18nData["governance.placeholders.init"]}" required>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.initCalldata">${i18nData["governance.formFields.initCalldata"]}</label>
          <textarea id="initCalldata" class="form-control" rows="3" placeholder="${i18nData["governance.placeholders.initCalldata"]}" required></textarea>
        </div>
        <div class="form-group">
          <label data-i18n="governance.formFields.votingPeriodBlocks">${i18nData["governance.formFields.votingPeriodBlocks"]}</label>
          <input type="number" id="votingPeriodBlocks" class="form-control" placeholder="${i18nData["governance.placeholders.votingPeriodBlocks"]}" required>
        </div>
      `;
      break;

    default:
      fieldsHTML = "";
  }

  dynamicFields.innerHTML = fieldsHTML;
}