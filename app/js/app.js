/**
 * 主应用逻辑 - 最小可行版本
 */

class FairStakeApp {
  
  constructor() {
    this.tronWebConnector = window.tronWebConnector;
    // 确保正确获取合约交互模块
    if (!window.contractInteraction) {
      window.contractInteraction = new ContractInteraction(
        this.tronWebConnector
      );
    }
    this.contractInteraction = window.contractInteraction || null;
    if (!this.contractInteraction) {
      console.warn("合约交互模块未在window对象中找到");
    }

    this.account = null;
    this.updateTimer = null;
    this.completeUnstakeButton = null;
    this.unstakeCountdownElement = null;
    this.connectWalletButton = null;
    this.quickStakeButton = null;
    this.quickUnstakeButton = null;
    this.quickClaimButton = null;
    this.exchangeButton = null;
    this.dataRefreshTimer = null; // 存储定时器ID
    this.exchangeTokenInfo = null;
    this.common = window.fairStakeCommon;
    this.i18n = null;
    this.i18nDomManager = null;
  }

  /**
   * 初始化应用 - 完整版本
   */
  async init() {
    console.log("应用开始初始化...");
    var dao=await import("/js/fairdao.js");
    this.fairdao = new dao.default();
    await this.fairdao.init();
    window.fairdao = this.fairdao;

    try {
    
      // 确保DOM完全加载
      if (document.readyState !== "complete") {
        console.log("等待DOM加载完成...");
        await new Promise((resolve) => {
          window.addEventListener("load", resolve);
        });
        console.log("DOM加载完成");
      }

      // 初始化钱包连接
      await this.initWalletConnection();

      // 尝试重新获取合约交互模块（可能在DOM加载后才可用）
      this.tryInitializeContractInteraction();

      // 初始化按钮引用
      this.initButtonReferences();

      // 设置事件监听器
      this.setupWalletEventListeners();

      // 添加定时检查合约交互模块是否已可用
      if (!this.contractInteraction) {
        this.startContractInteractionChecker();
      }

      return true;
    } catch (error) {
      console.error("初始化错误:", error);
      return false;
    }
  }

  /**
   * 初始化钱包连接
   */
  async initWalletConnection() {
    try {
      // 确保tronWebConnector已加载
      if (!this.tronWebConnector) {
        console.log("等待tronWebConnector加载...");
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.tronWebConnector) {
              this.tronWebConnector = window.tronWebConnector;
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }

      // 确保tronWebConnector已初始化
      if (
        this.tronWebConnector &&
        typeof this.tronWebConnector.init === "function"
      ) {
        console.log("初始化tronWebConnector...");
        await this.tronWebConnector.init();
        console.log("tronWebConnector初始化完成");
      }

      // 检查是否已连接
      if (this.tronWebConnector && this.tronWebConnector.getIsConnected()) {
        this.account = this.tronWebConnector.getAccount();
        console.log("钱包已连接,initWalletConnection:", this.account);
        await this.common.changeNetwork();
        if (this.contractInteraction) {
          this.contractInteraction.resetContract();
        }
        this.updateWalletUI(true);
      }

      // 合约功能按钮将在init方法中初始化，避免重复调用
    } catch (error) {
      console.error("钱包连接初始化错误:", error);
    }
  }

  /**
   * 初始化DOM引用
   */
  initDOMReferences() {
    // 获取连接钱包按钮引用
    this.connectWalletButton = document.getElementById("connectWallet");
  }

  // 重命名方法以保持兼容性
  initButtonReferences() {
    this.initDOMReferences();
  }

  /**
   * 设置钱包相关的事件监听器
   */
  setupWalletEventListeners() {
    // 监听钱包连接事件
    if (this.tronWebConnector) {
      this.tronWebConnector.on(
        "connected",
        this.handleWalletConnected.bind(this)
      );
      this.tronWebConnector.on(
        "disconnected",
        this.handleWalletDisconnected.bind(this)
      );
      this.tronWebConnector.on(
        "accountsChanged",
        this.handleAccountsChanged.bind(this)
      );
      this.tronWebConnector.on(
        "networkChanged",
        this.handleNetworkChanged.bind(this)
      );
    }

    // 设置连接钱包按钮点击事件
    if (this.connectWalletButton) {
      this.connectWalletButton.addEventListener(
        "click",
        this.connectWallet.bind(this)
      );
    }
  }

  /**
   * 连接钱包
   */
  async connectWallet() {
    try {
      if (!this.tronWebConnector) {
        throw new Error("tronWebConnector is null");
      }
      const result = await this.tronWebConnector.connect();
      if (result.success) {
        this.account = result.account;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("connectWallet error:", error);
      this.common.showMessage("error", this.fairdao.translator.translate("network.connect.error") );
    }
  }

  /**
   * 处理钱包连接成功事件
   */
  async handleWalletConnected() {
    console.log("wallet connected:", this.tronWebConnector.getIsConnected());

    this.account = await this.tronWebConnector.getAccount();
    await this.common.changeNetwork();
    this.contractInteraction.resetContract();
    this.updateWalletUI(true);
    debugger;
    if(this.common.network.name!=="MAINNET"){ 
        this.common.showMessage("warning", this.fairdao.translator.translate("network.warnning"));
      return;
    }
    
  }

  /**
   * 处理钱包断开连接事件
   */
  handleWalletDisconnected() {
    this.account = null;
    this.updateWalletUI(false);
    this.common.showMessage("warning", this.fairdao.translator.translate("network.disconnect"));

    // 禁用功能按钮
    const actionButtons = document.querySelectorAll(".action-section button");
    actionButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add("is-disabled");
    });

    // 重置用户数据显示
    const stakedAmount = document.getElementById("stakedAmount");
    const earnedTokens = document.getElementById("earnedTokens");
    const unstakeRequestAmount = document.getElementById(
      "unstakeRequestAmount"
    );
    const unstakeCountdown = document.getElementById("unstakeCountdown");

    if (stakedAmount) stakedAmount.value = "0.00";
    if (earnedTokens) earnedTokens.value = "0.00";
    if (unstakeRequestAmount) unstakeRequestAmount.value = "0.00";
    if (unstakeCountdown) unstakeCountdown.textContent = "";

  }

  /**
   * 处理账户变更事件
   */
  handleAccountsChanged(data) {
    console.log("accountsChanged:", data.account);
    this.account = data.account;
    this.updateWalletUI(true);
  }

  /**
   * 处理网络变更事件
   */
  handleNetworkChanged(data) {
    console.log("networkChanged:", data.networkId);
    // 重新加载奖励代币选项
    this.loadRewardTokenOptions();
  }

  /**
   * 更新钱包UI显示
   */
  updateWalletUI(isConnected) {
    const walletInfo = document.getElementById("walletInfo");
    const walletAddress = document.getElementById("walletAddress");

    // 确保有加载图标元素，如果没有则创建（使用CSS控制定位）
    let loadingIndicator = document.getElementById("dataLoadingIndicator");
    if (!loadingIndicator) {
      loadingIndicator = document.createElement("div");
      loadingIndicator.id = "dataLoadingIndicator";
      loadingIndicator.className = "loading-indicator is-hidden";
      loadingIndicator.innerHTML =
        '<span class="icon"><i class="fa fa-spinner fa-spin"></i></span>';

      // 添加到body，让CSS控制居中定位
      document.body.appendChild(loadingIndicator);
    }

    if (walletInfo && walletAddress) {
      if (isConnected && this.account) {
        // 截断显示地址
        const shortAddress = this.truncateAddress(this.account);
        walletAddress.textContent = `${this.common.network.name}: ${shortAddress}`;
        walletAddress.title = this.account;

        // 显示钱包信息，隐藏连接按钮
        walletInfo.classList.remove("is-hidden");
        if (this.connectWalletButton) {
          this.connectWalletButton.classList.add("is-hidden");
        }
      } else {
        // 隐藏钱包信息，显示连接按钮
        walletInfo.classList.add("is-hidden");
        if (this.connectWalletButton) {
          this.connectWalletButton.classList.remove("is-hidden");
        }
      }
    }
  }

  /**
   * 截断地址显示
   */
  truncateAddress(address) {
    if (!address || address.length < 10) return address;
    return (
      address.substring(0, 6) + "..." + address.substring(address.length - 4)
    );
  }

  /**
   * 尝试初始化合约交互模块
   */
  tryInitializeContractInteraction() {
    if (!this.contractInteraction && window.contractInteraction) {
      this.contractInteraction = window.contractInteraction;
      console.log("contractInteraction initialized");
      if (
        this.contractInteraction &&
        typeof this.contractInteraction.init === "function"
      ) {
        this.contractInteraction
          .init()
          .then((result) => {
            if (result.success) {
              console.log("合约实例初始化成功");
            } else {
              console.warn(
                "合约实例初始化失败，将在调用时重新尝试:",
                result.error
              );
            }
          })
          .catch((err) => {
            console.warn("contractInteraction init error:", err);
          });
      }
    }
  }

  /**
   * 启动合约交互模块检查器
   */
  startContractInteractionChecker() {
    console.log("启动合约交互模块检查器...");
    this.contractCheckerTimer = setInterval(() => {
      this.tryInitializeContractInteraction();
      // 如果已成功初始化，清除定时器
      if (this.contractInteraction) {
        clearInterval(this.contractCheckerTimer);
        this.contractCheckerTimer = null;
        console.log("合约交互模块检查器已停止");
      }
    }, 2000); // 每2秒检查一次
  }
}

// 确保DOM加载完成后初始化
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM已加载，准备初始化应用...");
  const common = new Common();
  await common.init();
  const app = new FairStakeApp();
  await app.init();
  window.app = app;
  const loadHome = document.getElementById("loadHome");
  if (loadHome) {
    loadHome.click();
  }
});
