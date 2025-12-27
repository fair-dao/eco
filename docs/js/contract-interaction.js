/**
 * 合约交互模块
 * 负责与FairStakeToken智能合约进行交互
 */

class ContractInteraction {
  constructor(tronWebConnector) {
    this.tronWebConnector = tronWebConnector;
    this.contract = null;
    this.readFrContract = null;
    this.fairContract = null;
    this.frContract = null;
    this.contractAddress = null;
    this.config = null;
    this.common = null;
    this.fairAddress = null;
  }

  async resetContract() {
    // 获取合约地址
    if (this.config == null && !this.isInitialized()) {
      this.init();
      return;
    }
    const contractABI = this.config.abis.fairstake;

    const tronWeb = this.tronWebConnector.getTronWeb();
    if (this.common.network == null) {
      await this.common.changeNetwork();
    }
    if (this.common.network) {
      this.contractAddress = this.common.network.rewardToken.address;
      this.fairAddress = this.common.network.stakedToken.address;
      if (this.common.network.name) {
        if (this.common.network.name === "NILE") {
          document.body.classList.add("test");
        } else if (this.common.network.name === "MAINNET") {
          document.body.classList.remove("test");
        }
      }
      if (!this.contractAddress) {
        throw new Error(`当前网络未配置合约地址`);
      }
      // 创建合约实例
      this.contract = await tronWeb.contract(contractABI, this.contractAddress);
      console.log("init contract:", this.contractAddress);
      this.fairContract = await tronWeb.contract(
        this.config.abis.ierc20,
        this.fairAddress
      );
      this.frContract = await tronWeb.contract(
        this.config.abis.ierc20,
        this.contractAddress
      );
      const readWeb = this.tronWebConnector.getReadTronWeb();
      this.readFrContract= await readWeb.contract(
        contractABI,
        this.contractAddress
      );
    } else {
      console.error("未发现网络");
    }
  }
  /**
   * 初始化合约实例
   */
  async init() {
    try {
      // 确保ierc20 ABI已经加载完成
      while (!(window.CONFIG && window.CONFIG.abis.ierc20)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.config = window.CONFIG;
      this.common = window.fairStakeCommon;

      // 等待TronWeb连接
      if (this.tronWebConnector.getIsConnected()) {
        this.common.changeNetwork();
        await this.resetContract();
      }

      return { success: true };
    } catch (error) {
      console.error("初始化合约失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取合约实例
   */
  getContract() {
    return this.contract;
  }

  /**
   * 获取FR代币的小数位数
   */
  async getFRDecimals() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const decimals = await this.contract.decimals().call();
      return {
        success: true,
        data: parseInt(decimals),
      };
    } catch (error) {
      console.error("获取FR代币小数位数失败:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async claimTestFairToken() {
    const tronWeb = this.tronWebConnector.getTronWeb();
    const account = tronWeb.defaultAddress.base58;
    // 创建代币合约实例
    const tokenContract = await tronWeb.contract(
      [
        {
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
          ],
          name: "mint50000IfBalanceLow",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      this.fairAddress
    );
    return await this.common.send(
      tokenContract,
      "mint50000IfBalanceLow",
      "正在领取...",
      {
        from: account,
      },
      account
    );
  }

  /**
   * 获取指定代币的小数位数
   * @param {string} tokenAddress - 代币地址
   */
  async getTokenDecimals(tokenAddress) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      // 创建代币合约实例
      const tokenContract = await tronWeb.contract(
        this.config.abis.ierc20,
        tokenAddress
      );
      const decimals = await tokenContract.decimals().call();

      return {
        success: true,
        data: parseInt(decimals),
      };
    } catch (error) {
      console.error(`获取代币 ${tokenAddress} 小数位数失败:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取合约地址
   */
  getContractAddress() {
    return this.contractAddress;
  }

  /**
   * 检查合约是否已初始化
   */
  isInitialized() {
    return this.contract !== null;
  }

  // 获取并显示账户信息（TRX余额、能量、带宽）
  async getAccountInfo(account) {
    let result = { data: {} };

    try {
      const tronWeb = this.tronWebConnector.getTronWeb();
      // 获取TRX余额
      const trxBalance = await tronWeb.trx.getBalance(account);
      // 确保转换为数字类型
      const trxBalanceInTRX = parseFloat(tronWeb.fromSun(trxBalance) || 0);
      result.data.trx = trxBalanceInTRX.toFixed(6);
      // 获取账户资源（能量和带宽）
      const accountResources = await tronWeb.trx.getAccountResources(account);

      // 显示能量
      if (accountResources && accountResources.EnergyLimit) {
        const energyLimit = accountResources.EnergyLimit;
        let energyUsed = 0;
        if (accountResources.EnergyUsed) {
          energyUsed = accountResources.EnergyUsed;
        }
        const energyRemaining = energyLimit - energyUsed;
        result.data.energyRemaining = energyRemaining;
        result.data.energyLimit = energyLimit;
      } else {
        result.data.energyRemaining = 0;
        result.data.energyLimit = 0;
      }
      // 显示带宽
      if (accountResources && accountResources.freeNetLimit) {
        let bandwidthLimit = accountResources.freeNetLimit;
        if (accountResources.NetLimit) {
          bandwidthLimit += accountResources.NetLimit;
        }
        let netUsed = 0;
        if (accountResources.NetUsed) {
          netUsed += accountResources.NetUsed;
        }
        if (accountResources.freeNetUsed) {
          netUsed += accountResources.freeNetUsed;
        }
        result.data.bandwidthRemaining = bandwidthLimit - netUsed;
        result.data.bandwidthLimit = bandwidthLimit;
      } else {
        result.data.bandwidthRemaining = 0;
        result.data.bandwidthLimit = 0;
      }
      result.state = "ok";
    } catch (error) {
      console.error("获取账户信息失败:", error);
      result.state = "error";
      result.msg = error.message;
    }
    return result;
  }

  /**
   * 质押操作
   */
  async stake(amount) {
    if (!this.isInitialized()) {
      await this.init();
    }

    const tronWeb = this.tronWebConnector.getTronWeb();
    const account = this.tronWebConnector.getAccount();

    // Validate account exists before proceeding
    if (!account) {
      this.common.hideLoading();
      throw new Error("钱包未连接或账户不可用，请连接钱包后再试");
    }

    // 转换金额为合约所需的精度
    // 使用BigNumber安全地处理精度转换，避免科学记数法
    const decimals = this.common.network.stakedToken.decimals;
    const amountInContract = tronWeb
      .toBigNumber(amount)
      .multipliedBy(new tronWeb.BigNumber(10).pow(decimals))
      .toString(10);

    // 检查授权
    const allowance = await this.checkAllowance(account);
    // 使用tronWeb.BigNumber进行比较，确保兼容性
    if (
      tronWeb
        .toBigNumber(allowance.toString())
        .lt(tronWeb.toBigNumber(amountInContract))
    ) {
      this.common.showLoading("正在授权,请签名确认...");
      // 需要授权
      await this.approve(amountInContract);
    }
    return await this.common.send(
      this.contract,
      "stake",
      "正在质押,请签名确认...",
      {
        from: account,
      },
      amountInContract
    );
  }

  /**
   * 申请提取代币（unstake）
   * 注意：申请后需要等待所选锁定期才能提取代币
   * @param {string} amount - 解押金额
   * @param {number} waitDays - 解押等待期（天数）
   */
  async requestUnstake(amount, waitDays = 60) {
    if (!this.isInitialized()) {
      await this.init();
    }

    const tronWeb = this.tronWebConnector.getTronWeb();
    const account = this.tronWebConnector.getAccount();

    // 转换金额为合约所需的精度
    // 使用BigNumber安全地处理精度转换，避免科学记数法
    const decimals = this.common.network.stakedToken.decimals;
    const amountInContract = tronWeb
      .toBigNumber(amount)
      .multipliedBy(new tronWeb.BigNumber(10).pow(decimals))
      .toString(10);

    // 调用申请解押函数，传递等待期参数
    return await this.common.send(
      this.contract,
      "requestUnstake",
      "正在申请解押,请签名确认...",
      {
        from: account,
      },
      amountInContract,
      waitDays
    );
  }

  /**
   * 完成提取（unstake）
   * 注意：需要先完成申请提取并等待锁定期结束
   */
  async unstake() {
    if (!this.isInitialized()) {
      await this.init();
    }

    const account = this.tronWebConnector.getAccount();

    // 调用解押函数 - 注意：unstake函数不需要额外参数，所以args部分为空
    return await this.common.send(
      this.contract,
      "unstake",
      "正在提取,请签名确认...",
      {
        from: account,
      }
      // 这里不需要传递额外的参数，因为unstake函数不需要参数
    );
  }

  /**
   * 领取奖励
   */
  async claimReward() {
    if (!this.isInitialized()) {
      await this.init();
    }

    const account = this.tronWebConnector.getAccount();
    this.common.showLoading("正在领取奖励,请签名确认...");

    // 调用领取奖励函数
    return await this.common.send(
      this.contract,
      "claimReward",
      "正在领取奖励,请签名确认...",
      {}
    );
  }

  /**
   * 代币交换 - 通过销毁FR获取其他奖励代币
   */
  async exchangeFRForToken(tokenAddress, frAmount) {
    if (!this.isInitialized()) {
      await this.init();
    }

    const tronWeb = this.tronWebConnector.getTronWeb();
    const account = this.tronWebConnector.getAccount();

    // 转换金额为合约所需的精度
    // 使用BigNumber安全地处理精度转换，避免科学记数法
    const decimals = this.common.network.rewardToken.decimals;
    const amountInContract = tronWeb
      .toBigNumber(frAmount)
      .multipliedBy(new tronWeb.BigNumber(10).pow(decimals))
      .toString(10);

    // 转换地址格式
    const hexAddress = tronWeb.address.toHex(tokenAddress);
    // 调用交换函数
    return await this.common.send(
      this.contract,
      "exchangeFRForToken",
      "正在进行代币交换,请签名确认...",
      {
        from: account,
      },
      hexAddress,
      amountInContract
    );
  }

  /**
   * 获取用户FairStakeToken质押信息
   * @param {string} account - 用户地址
   * @returns {Promise} 返回用户质押信息，包括质押数量、开始时间、上次领取奖励时间、解除质押等待天数等
   */
  async getUserStakeInfo(account) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAccount = tronWeb.address.toHex(account);

      // 调用合约获取用户质押信息（已更新ABI，包含unstakeWaitDays返回值）
      const result = await this.contract.getUserStakeInfo(hexAccount).call();

      // 转换回可读格式
      const decimals = this.config.app.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        data: {
          stakedAmount: tronWeb
            .toBigNumber(result.amount)
            .dividedBy(divisor)
            .toString(),
          unstakeRequestAmount: tronWeb
            .toBigNumber(result.unstakeRequestAmount)
            .dividedBy(divisor)
            .toString(),
          unstakeRequestTime: result.unstakeRequestTime,
          unstakeWaitDays: parseInt(result.unstakeWaitDays) || 30, // 新增：获取解除质押等待天数，默认30天
        },
      };
    } catch (error) {
      console.error("获取用户质押信息失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户FairStakeToken余额
   */
  async getFairTokenBalance(account) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAccount = tronWeb.address.toHex(account);

      // 调用已初始化的FAIR代币合约获取余额
      const balance = await this.fairContract.balanceOf(hexAccount).call();

      // 转换回可读格式
      const decimals = this.common.network.stakedToken.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        balance: tronWeb.toBigNumber(balance).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("获取FAIR代币余额失败:", error);
      return { success: false, error: error.message };
    }
  }

  async getERC20Balance(tokenAddress, account) {    
       const tronWeb = this.tronWebConnector.getTronWeb();
       const hexAccount = tronWeb.address.toHex(account);
       const erc20Contract = await tronWeb.contract(
        this.config.abis.ierc20,
        tokenAddress
      );
       const balance = await erc20Contract.balanceOf(hexAccount).call();
       const decimals = await erc20Contract.decimals().call();
       const divisor = new tronWeb.BigNumber(10).pow(decimals);
       return parseFloat(tronWeb.toBigNumber(balance).dividedBy(divisor)).toFixed(6);
  }

  async getTRXBalance(account){
         const tronWeb = this.tronWebConnector.getTronWeb();
      // 获取TRX余额
      const trxBalance = await tronWeb.trx.getBalance(account);
      // 确保转换为数字类型
      const trxBalanceInTRX = parseFloat(tronWeb.fromSun(trxBalance) || 0);
      return trxBalanceInTRX.toFixed(6);
  }




  /**
   * 获取用户FR代币余额
   */
  async getFrTokenBalance(account) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAccount = tronWeb.address.toHex(account);

      // 调用FR代币合约的balanceOf函数获取余额
      const balance = await this.frContract.balanceOf(hexAccount).call();

      // 转换回可读格式
      const decimals = this.config.app.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        balance: tronWeb.toBigNumber(balance).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("获取FR代币余额失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 检查授权额度 - 现在检查对fair代币合约的授权
   */
  async checkAllowance(account) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAccount = tronWeb.address.toHex(account);
      const hexContractAddress = tronWeb.address.toHex(this.contractAddress);

      // 检查用户对质押合约的fair代币授权
      const allowance = await this.fairContract
        .allowance(hexAccount, hexContractAddress)
        .call();

      return tronWeb.toBigNumber(allowance);
    } catch (error) {
      console.error("检查授权失败:", error);
      // 在catch块中重新获取tronWeb实例
      const tronWeb = this.tronWebConnector.getTronWeb();
      return tronWeb.toBigNumber(0);
    }
  }

  /**
   * 授权合约 - 现在向fair代币合约请求授权
   */
  async approve(amount) {
    const account = this.tronWebConnector.getAccount();

    // Validate account exists before proceeding
    if (!account) {
      this.common.hideLoading();
      throw new Error("钱包未连接或账户不可用，请连接钱包后再试");
    }

    const tronWeb = this.tronWebConnector.getTronWeb();
    const hexContractAddress = tronWeb.address.toHex(this.contractAddress);

    // 向fair代币合约请求授权
    return await this.common.send(
      this.fairContract,
      "approve",
      "正在授权合约,请签名确认...",
      {
        from: account,
      },
      hexContractAddress,
      amount
    );
  }

  /**
   * 计算用户可领取的奖励代币数量
   */
  async calculateEarnedTokens(account) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAccount = tronWeb.address.toHex(account);

      // 调用合约获取可领取的奖励代币数量
      const earnedTokens = await this.contract
        .calculateEarnedTokens(hexAccount)
        .call();

      // 转换回可读格式
      const decimals = this.config.app.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        data: tronWeb.toBigNumber(earnedTokens).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("计算可领取奖励失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取奖励率
   * @returns {Promise} 返回当前的奖励率，基于总质押量计算，范围为100-500
   */
  async getRate() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const rate = await this.contract.getRate().call();
      return {
        success: true,
        rate: rate.toString(),
      };
    } catch (error) {
      console.error("获取奖励率失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取总供应量
   */
  async totalSupply() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const supply = await this.contract.totalSupply().call();

      // 转换回可读格式
      const decimals = this.config.app.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        data: tronWeb.toBigNumber(supply).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("获取总供应量失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取总质押量
   */
  async totalStaked() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const staked = await this.contract.totalStaked().call();

      // 转换回可读格式
      const decimals = this.config.app.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        data: tronWeb.toBigNumber(staked).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("获取总质押量失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取总解押数量
   */
  async totalUnstaking() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const tronWeb = this.tronWebConnector.getTronWeb();
      const unstaking = await this.contract.totalUnstaking().call();

      // 转换回可读格式
      const decimals = this.common.network.rewardToken.decimals;
      const divisor = new tronWeb.BigNumber(10).pow(decimals);
      return {
        success: true,
        data: tronWeb.toBigNumber(unstaking).dividedBy(divisor).toString(),
      };
    } catch (error) {
      console.error("获取总解押数量失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 转账代币
   */
  async transfer(recipient, amount) {
    if (!this.isInitialized()) {
      await this.init();
    }

    const tronWeb = this.tronWebConnector.getTronWeb();
    const account = this.tronWebConnector.getAccount();
    const hexRecipient = tronWeb.address.toHex(recipient);

    // 转换金额为合约所需的精度
    const decimals = this.config.app.decimals;
    const amountInContract = tronWeb
      .toBigNumber(amount)
      .multipliedBy(new tronWeb.BigNumber(10).pow(decimals))
      .toString(10);

    // 调用转账函数
    return await this.common.send(
      this.contract,
      "transfer",
      "正在转账,请签名确认...",
      {
        from: account,
      },
      hexRecipient,
      amountInContract
    );
  }

  /**
   * 获取代币的小数位数
   */
  async decimals() {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const decimals = await this.contract.decimals().call();
      return {
        success: true,
        decimals: decimals.toString(),
      };
    } catch (error) {
      console.error("获取小数位数失败:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化代币数量显示
   */
  formatTokenAmount(amount, decimals = 6) {
    if (!amount) return "0";

    const num = parseFloat(amount);
    if (isNaN(num)) return "0";

    // 根据数值大小选择合适的显示格式
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    } else {
      // 对于小数值，始终保留指定小数位数，避免科学记数法
      return num.toFixed(decimals);
    }
  }

  /**
   * 计算解押剩余时间
   */
  /**
   * 计算解除质押剩余时间
   * @param {string|number} requestTime - 解除质押请求时间戳
   * @param {number} unstakeWaitDays - 解除质押等待天数（从合约获取，15-60天）
   * @returns {string} 格式化后的剩余时间
   */
  calculateUnstakeTimeRemaining(requestTime, unstakeWaitDays = 30) {
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    // 将天数转换为秒数（1天 = 86400秒）
    const lockPeriod = BigInt(unstakeWaitDays * 86400);

    if (requestTime + lockPeriod <= currentTime) return "已解锁";
    else {
      const remaining = Number(requestTime + lockPeriod - currentTime);
      // 格式化时间
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      if (days > 0) {
        return `${days}天 ${hours}小时`;
      } else if (hours > 0) {
        return `${hours}小时 ${minutes}分钟`;
      } else if (minutes > 0) {
        return `${minutes}分钟`;
      } else {
        return `${seconds}秒`;
      }
    }
  }

  /**
   * 检查特定模块是否被暂停
   * @param {number} moduleId - 模块ID
   * @returns {Promise} 返回模块暂停状态
   */
  async isModulePaused(moduleId) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      // 检查合约是否支持pausedModules方法
      if (!this.contract || typeof this.contract.pausedModules !== "function") {
        console.warn("合约不支持pausedModules方法");
        // 返回默认状态，表示模块正常运行
        return {
          success: true,
          isPaused: false,
        };
      }

      // 调用正确的合约方法pausedModules
      const isPaused = await this.contract.pausedModules(moduleId).call();
      return {
        success: true,
        isPaused: isPaused,
      };
    } catch (error) {
      console.error(`检查模块 ${moduleId} 暂停状态失败:`, error);
      // 发生错误时，默认返回模块未暂停状态，避免UI一直处于加载中
      return {
        success: true,
        isPaused: false,
        warning: "无法从合约获取模块状态，默认显示为正常运行",
      };
    }
  }

  /**
   * 暂停特定模块
   * @param {number} moduleId - 模块ID
   * @returns {Promise} 交易结果
   */
  async pauseModule(moduleId) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const account = this.tronWebConnector.getAccount();
      return await this.common.send(
        this.contract,
        "pauseModule",
        `正在暂停模块 ${moduleId},请签名确认...`,
        {
          from: account,
        },
        moduleId
      );
    } catch (error) {
      console.error(`暂停模块 ${moduleId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 恢复特定模块
   * @param {number} moduleId - 模块ID
   * @returns {Promise} 交易结果
   */
  async unpauseModule(moduleId) {
    try {
      if (!this.isInitialized()) {
        await this.init();
      }

      const account = this.tronWebConnector.getAccount();
      return await this.common.send(
        this.contract,
        "unpauseModule",
        `正在恢复模块 ${moduleId},请签名确认...`,
        {
          from: account,
        },
        moduleId
      );
    } catch (error) {
      console.error(`恢复模块 ${moduleId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取代币兑换信息（包括兑换率和时间范围）
   * @param {string} token - 目标代币地址
   * @returns {Promise} 返回代币兑换信息
   */
  async getTokenExchangeInfo(token) {
    try {     

      const tronWeb = this.tronWebConnector.getTronWeb();
      const hexAddress = tronWeb.address.toHex(token.address);

      // 正确读取合约的tokenExchangeInfo映射
      const exchangeInfo = await this.contract
        .tokenExchangeInfo(hexAddress)
        .call();
      if (exchangeInfo.rateDenominator === 0n) {
        return { success: false, error: "目前未开通兑换" };
      }    

      // 计算结束时间（一周有604800秒）
      const endTime =
        parseInt(exchangeInfo.startTime) +
        parseInt(exchangeInfo.exchangeDurationWeeks>254 ? 100000 : exchangeInfo.exchangeDurationWeeks) * 604800;
      // 获取FR代币和目标代币的小数点位数
      let frDecimals =
        this.config.networks[this.config.currentNetwork]?.rewardToken
          ?.decimals || 18;
      return {
        success: true,
        data: {
          remainingExchangeAmount:
            exchangeInfo.remainingExchangeAmount.toString(),
          rateNumerator: exchangeInfo.rateNumerator.toString(),
          rateDenominator: exchangeInfo.rateDenominator.toString(),
          frDecimals: frDecimals,
          tokenDecimals: token.decimals,
          startTime: exchangeInfo.startTime.toString(),
          endTime: endTime.toString(),
          exchangeDurationWeeks: exchangeInfo.exchangeDurationWeeks.toString(),
          transferType: exchangeInfo.transferType.toString(),
        },
      };
    } catch (error) {
      console.error("获取代币兑换信息失败:", error);
      return { success: false, error: error.message };
    }
  }

  
  /**
   * 获取任意合约的链上事件
   * @param {string} contractAddress - 合约地址
   * @param {string[]} eventNames - 事件名称数组（可选）
   * @param {number} fromBlock - 起始区块
   * @param {number} toBlock - 结束区块
   * @returns {Promise} 包含事件列表的 Promise
   */
  async getEvents(contractAddress, eventNames, fromBlock, toBlock) {
    try {
      // 获取指定合约地址的所有事件
      let events = [];
      if (!eventNames) {
        events = await this.common.getContractEvents(
          contractAddress,
          null,
          fromBlock,
          toBlock
        );
      } else {
        for (let i = 0; i < eventNames.length; i++) {
          const eventName = eventNames[i];
          const event = await this.common.getContractEvents(
            contractAddress,
            eventName,
            fromBlock,
            toBlock
          );
          events = events.concat(event);
        }
        events.sort((a, b) => a.block_number - b.block_number);
      }
      let es = [];
      for (let i = 0; i < events.length; i++) {
        const e = events[i];
        const logIndex = e.event_index;
        let amount = 0;
        console.log(e);
        const txId = e.transaction_id;
        if (e.result == {}) {
          const txInfo = await tronWeb.trx.getTransactionInfo(txId);
          if (!txInfo) {
            debugger;
            //找到事件的ABI
            const eventABI = this.contract.abi.find(
              (item) => item.name === e.event_name && e.type == "event"
            );
            if (eventABI) {
              const curLog = txInfo.log[logIndex];
              const decodedLog = tronWeb.utils.abi.decodeLog(
                eventABI.inputs,
                curLog.data,
                curLog.topic.slice(1)
              );
              e.result = decodedLog;
            } else continue;
          } else continue;
        }
        let item = {
          eventName: e.event_name,
          blockNumber: e.block_number,
          transactionId: e.transaction_id,
          logIndex: logIndex,
          timestamp: e.block_timestamp,
          result: e.result
        };
        es.push(item);
      }
      return es;
    } catch (error) {
      console.error(`get contract events (${contractAddress}):`, error);
      return [];
    }
  }
}
