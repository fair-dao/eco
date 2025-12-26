# FairStakeToken TRON H5 Application

This is a responsive H5 application built with Bulma framework and TronWeb library, designed to interact with the FairStakeToken smart contract on the TRON blockchain.

## Features

- **Wallet Connection**: Connect to TRON blockchain using TronWeb wallet
- **Token Staking**: Stake your tokens to earn rewards
- **Unstaking**: Request unstaking and complete unstaking after the lock period
- **Reward Claiming**: Claim your accumulated staking rewards
- **Token Exchange**: Exchange your tokens based on the contract's exchange rate
- **Real-time Balance Display**: View your token and TRX balances
- **Staking Information**: View detailed staking information including locked amount and release time
- **Network Switching**: Support for mainnet and testnet networks

## Technical Stack

- **Frontend Framework**: Bulma CSS Framework
- **Blockchain Library**: TronWeb
- **Languages**: HTML5, CSS3, JavaScript
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- A modern web browser
- A TRON-compatible wallet (e.g., TronLink, TronWallet)
- TRX for transaction fees
- FairStakeToken tokens for staking

### Installation

1. Clone or download the application files to your local machine
2. Host the application on a web server or open the index.html file directly in your browser

### Usage

#### Connect Wallet

1. Click the "Connect Wallet" button in the top navigation bar
2. Authorize the connection with your TRON wallet
3. Your wallet address will be displayed in the top navigation bar

#### Stake Tokens

1. Navigate to the "Stake" section
2. Enter the amount of tokens you want to stake
3. Click the "Stake" button
4. Confirm the transaction in your wallet

#### Request Unstaking

1. Navigate to the "Unstake" section
2. Enter the amount of tokens you want to unstake
3. Click the "Request Unstake" button
4. Confirm the transaction in your wallet

#### Complete Unstaking

1. After the lock period has passed (3 days), navigate to the "Unstake" section
2. Click the "Complete Unstake" button
3. Confirm the transaction in your wallet

#### Claim Rewards

1. Navigate to the "Claim Rewards" section
2. Click the "Claim Rewards" button
3. Confirm the transaction in your wallet

#### Exchange Tokens

1. Navigate to the "Token Exchange" section
2. Enter the amount of tokens you want to exchange
3. Click the "Exchange" button
4. Confirm the transaction in your wallet

## Contract Information

### Main Functions

- `stake(uint256 amount)`: Stake tokens to earn rewards
- `requestUnstake(uint256 amount)`: Request to unstake tokens
- `unstake(uint256 index)`: Complete the unstaking process after lock period
- `claimReward()`: Claim accumulated staking rewards
- `exchange(uint256 amount)`: Exchange tokens based on the contract's exchange rate
- `getTokenExchangeInfo(address tokenAddress)`: Get the exchange information for a specific token

### TokenExchangeInfo Structure

```solidity
struct TokenExchangeInfo {
    uint88 rateNumerator;      // Numerator of the exchange rate (88-bit integer)
    uint88 rateDenominator;    // Denominator of the exchange rate (88-bit integer)
    uint8 exchangeDurationWeeks; // Duration of the exchange period in weeks
    uint256 remainingExchangeAmount; // Remaining amount available for exchange
    uint64 startTime;          // Start time of the exchange period (timestamp)
}
```

The `rateNumerator` and `rateDenominator` fields are represented as uint88 to support larger precision for exchange rates.

### Events

- `Staked(address indexed user, uint256 amount)`: Emitted when tokens are staked
- `Unstaked(address indexed user, uint256 amount)`: Emitted when tokens are unstaked
- `RewardClaimed(address indexed user, uint256 amount)`: Emitted when rewards are claimed
- `TokenExchanged(address indexed user, uint256 amount)`: Emitted when tokens are exchanged

## Configuration

The application configuration is stored in `config.json` file. You can update the following parameters:

- **Network Configuration**: Mainnet and testnet node URLs
- **Contract Address**: The address of the deployed FairStakeToken contract
- **Contract ABI**: The Application Binary Interface of the contract
- **Time Constants**: Staking lock period and other time-related parameters

## Security Considerations

- Always verify transaction details before confirming in your wallet
- Ensure you are connected to the correct network (mainnet or testnet)
- Be cautious when interacting with smart contracts, especially with large amounts
- The application never stores your private keys or password

## Troubleshooting

### Common Issues

- **Wallet Connection Failed**: Ensure your wallet is installed and unlocked. Try refreshing the page.
- **Transaction Rejected**: Check if you have sufficient TRX for gas fees. Verify the transaction details.
- **Contract Not Found**: Ensure you are connected to the correct network and the contract address is valid.
- **Unstaking Not Available**: Wait for the 3-day lock period to pass before attempting to complete unstaking.

## Support

If you encounter any issues or have questions about using the application, please contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [TronWeb](https://github.com/tronprotocol/tronweb) - JavaScript library for interacting with the TRON blockchain
- [Bulma](https://bulma.io/) - Modern CSS framework based on Flexbox
- [Font Awesome](https://fontawesome.com/) - Icon library