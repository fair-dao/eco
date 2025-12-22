# FairStakeToken 波场H5应用

这是一个使用Bulma框架和TronWeb库构建的响应式H5应用，旨在与波场区块链上的FairStakeToken智能合约进行交互。

## 功能特性

- **钱包连接**：使用TronWeb钱包连接波场区块链
- **代币质押**：质押您的代币以赚取奖励
- **解除质押**：申请解除质押并在锁定期后完成解除质押
- **领取奖励**：领取您累积的质押奖励
- **代币交换**：根据合约的汇率交换您的代币
- **实时余额显示**：查看您的代币和TRX余额
- **质押信息**：查看详细的质押信息，包括锁定金额和释放时间
- **网络切换**：支持主网和测试网网络

## 技术栈

- **前端框架**：Bulma CSS框架
- **区块链库**：TronWeb
- **开发语言**：HTML5、CSS3、JavaScript
- **响应式设计**：移动优先的设计方法

## 快速开始

### 先决条件

- 现代网页浏览器
- 兼容波场的钱包（例如TronLink、TronWallet）
- 用于交易费用的TRX
- 用于质押的FairStakeToken代币

### 安装

1. 将应用文件克隆或下载到您的本地机器
2. 在网络服务器上托管应用程序或直接在浏览器中打开index.html文件

### 使用说明

#### 连接钱包

1. 点击顶部导航栏中的"连接钱包"按钮
2. 使用您的波场钱包授权连接
3. 您的钱包地址将显示在顶部导航栏中

#### 质押代币

1. 导航到"质押"部分
2. 输入您想要质押的代币数量
3. 点击"质押"按钮
4. 在钱包中确认交易

#### 申请解除质押

1. 导航到"解除质押"部分
2. 输入您想要解除质押的代币数量
3. 点击"申请解除质押"按钮
4. 在钱包中确认交易

#### 完成解除质押

1. 锁定期（3天）过后，导航到"解除质押"部分
2. 点击"完成解除质押"按钮
3. 在钱包中确认交易

#### 领取奖励

1. 导航到"领取奖励"部分
2. 点击"领取奖励"按钮
3. 在钱包中确认交易

#### 交换代币

1. 导航到"代币交换"部分
2. 输入您想要交换的代币数量
3. 点击"交换"按钮
4. 在钱包中确认交易

## 合约信息

### 主要函数

- `stake(uint256 amount)`：质押代币以赚取奖励
- `requestUnstake(uint256 amount)`：请求解除质押代币
- `unstake(uint256 index)`：锁定期后完成解除质押过程
- `claimReward()`：领取累积的质押奖励
- `exchange(uint256 amount)`：根据合约的汇率交换代币
- `getTokenExchangeInfo(address tokenAddress)`：获取特定代币的兑换信息

### TokenExchangeInfo结构体

```solidity
struct TokenExchangeInfo {
    uint88 rateNumerator;      // 兑换率的分子（88位整数）
    uint88 rateDenominator;    // 兑换率的分母（88位整数）
    uint8 exchangeDurationWeeks; // 兑换期持续时间（以周为单位）
    uint256 remainingExchangeAmount; // 剩余可兑换数量
    uint64 startTime;          // 兑换期开始时间（时间戳）
}
```

`rateNumerator`和`rateDenominator`字段使用uint88类型表示，以支持更高精度的兑换率。

### 事件

- `Staked(address indexed user, uint256 amount)`：代币质押时触发
- `Unstaked(address indexed user, uint256 amount)`：代币解除质押时触发
- `RewardClaimed(address indexed user, uint256 amount)`：奖励领取时触发
- `TokenExchanged(address indexed user, uint256 amount)`：代币交换时触发

## 配置

应用配置存储在`config.json`文件中。您可以更新以下参数：

- **网络配置**：主网和测试网节点URL
- **合约地址**：已部署的FairStakeToken合约地址
- **合约ABI**：合约的应用二进制接口
- **时间常量**：质押锁定期和其他与时间相关的参数

## 安全考虑

- 在钱包中确认交易前，请始终验证交易详情
- 确保您连接到正确的网络（主网或测试网）
- 与智能合约交互时要谨慎，尤其是涉及大额交易时
- 应用程序从不存储您的私钥或密码

## 故障排除

### 常见问题

- **钱包连接失败**：确保您的钱包已安装并解锁。尝试刷新页面。
- **交易被拒绝**：检查您是否有足够的TRX用于燃料费。验证交易详情。
- **找不到合约**：确保您连接到正确的网络，并且合约地址有效。
- **无法解除质押**：等待3天锁定期过后再尝试完成解除质押。

## 支持

如果您遇到任何问题或对使用应用程序有疑问，请联系开发团队。

## 许可证

本项目基于MIT许可证 - 详见LICENSE文件了解详情。

## 致谢

- [TronWeb](https://github.com/tronprotocol/tronweb) - 用于与波场区块链交互的JavaScript库
- [Bulma](https://bulma.io/) - 基于Flexbox的现代CSS框架
- [Font Awesome](https://fontawesome.com/) - 图标库