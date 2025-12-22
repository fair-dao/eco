// User Account Information Module
class UserAccountModule {
  static lastInstance=null;
  constructor() {
    UserAccountModule.lastInstance=this;
    // 获取 tronWebConnector
    this.tronWebConnector = window.tronWebConnector;
    
    // 获取合约交互模块
    this.contractInteraction = window.contractInteraction;
    
    // 获取公共工具模块
    this.common = window.fairStakeCommon;
    this.account = null;

    // DOM 元素引用
    this.domElements = {
      trxBalance: null,
      accountEnergy: null,
      accountBandwidth: null,
      fairTokenBalance: null,
      frTokenBalance: null,
      stakedAmount: null,
      earnedTokens: null,
      unstakeRequestAmount: null,
      unstakeCountdown: null,
    };

  }

  /**
   * 初始化用户账户模块
   */
  async init() {
    try {
      console.log("初始化用户账户模块...");
      
      // 初始化多语言支持
      try {
        await this.i18n();
      } catch(ex) {
        console.log(ex);
      }

      // 初始化 DOM 元素引用
      this.initDOMReferences();

      // 初始化按钮事件监听器
      this.initButtonEventListeners();
      this.setupBasicEventListeners();

      if(this.common.tronWebConnector.getAccount()){        
        this.loadUserData();
        
      this.startDataRefreshTimer();     
      }
      return true;
    } catch (error) {
      console.error("用户账户模块初始化错误:", error);
      return false;
    }

  }
  /**
   * 设置基本事件监听器
   */
  setupBasicEventListeners() {
    if (this.completeUnstakeButton) {
      this.completeUnstakeButton.addEventListener(
        "click",
        this.handleCompleteUnstake.bind(this)
      );
    }
    // 领取FAIR代币按钮点击事件
    const claimBtn = document.getElementById("claimFairTokenBtn");
    if (claimBtn) {
      claimBtn.addEventListener("click", () => this.claimTestFairToken());
    }
    // 添加刷新按钮事件监听器
    const refreshStatsBtn = document.getElementById("refreshUserStatsBtn");
    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener("click", async () => {
        try {
          console.log("手动刷新数据开始执行");
          // 在刷新期间显示加载动画
          refreshStatsBtn.querySelector("i").classList.add("fa-spin");          
          await this.loadUserData(false);
          console.log("手动刷新数据执行完成");
        } catch (error) {
          console.error("手动刷新数据时出错:", error);
        } finally {
          // 无论成功或失败，都移除加载动画
          refreshStatsBtn.querySelector("i").classList.remove("fa-spin");
        }
      });
    }
  }

  /**
   * 加载用户数据
   */
  async loadUserData(isAutoRefresh = false) {
    console.log(isAutoRefresh ? "自动刷新加载用户数据" : "手动加载用户数据");

    // 自动刷新时，只旋转全局统计右上角的刷新图标
    const refreshBtn = document.getElementById("refreshUserStatsBtn");
    if(!refreshBtn) return;
    if (isAutoRefresh && refreshBtn) {
      refreshBtn.classList.add("fa-spin");
    }
    // 手动刷新时，显示加载图标
    else if (!isAutoRefresh) {
      const loadingIndicator = document.getElementById("dataLoadingIndicator");
      if (loadingIndicator) {
        loadingIndicator.classList.remove("is-hidden");
      }
    }
    try {
      // 非自动刷新时显示加载图标
      if (!isAutoRefresh) {
        const loadingIndicator = document.getElementById(
          "dataLoadingIndicator"
        );
        if (loadingIndicator) {
          loadingIndicator.classList.remove("is-hidden");
        }
      }
      const account = await this.tronWebConnector.getAccount();

      // 确保账户已连接
      if (!account) {
        const errorMessage = "账户未连接";
        console.log(errorMessage);
        // 非自动刷新时才显示消息
        if (!isAutoRefresh && this.common) {
          this.common.showMessage("warning", errorMessage);
        }
        return false;
      }

      // 确保合约实例已初始化
      if (
        this.contractInteraction &&
        !this.contractInteraction.isInitialized()
      ) {
        return;
      }

      const result = await this.contractInteraction.getAccountInfo(account);
      if (result.state === "ok") {
        document.getElementById("trxBalance").value = result.data.trx;
        document.getElementById(
          "accountEnergy"
        ).value = `${result.data.energyRemaining.toLocaleString()} / ${result.data.energyLimit.toLocaleString()}`;
        document.getElementById(
          "accountBandwidth"
        ).value = `${result.data.bandwidthRemaining.toLocaleString()} / ${result.data.bandwidthLimit.toLocaleString()}`;
      } else {
        document.getElementById("trxBalance").value = "获取失败";
        document.getElementById("accountEnergy").value = "获取失败";
        document.getElementById("accountBandwidth").value = "获取失败";
      }

      // 调用合约获取用户质押信息
      const stakeInfoResult = await this.contractInteraction.getUserStakeInfo(
        account
      );
      const earnedTokensResult =
        await this.contractInteraction.calculateEarnedTokens(account);
      // 获取FAIR代币余额
      const fairTokenBalanceResult =
        await this.contractInteraction.getFairTokenBalance(account);
      // 获取FR代币余额
      const frTokenBalanceResult =
        await this.contractInteraction.getFrTokenBalance(account);

      if (stakeInfoResult.success) {
        // 更新UI显示
        const stakedAmountElement = document.getElementById("stakedAmount");
        const earnedTokensElement = document.getElementById("earnedTokens");
        const unstakeRequestAmountElement = document.getElementById(
          "unstakeRequestAmount"
        );
        const fairTokenBalance = document.getElementById("fairTokenBalance");
        const frTokenBalance = document.getElementById("frTokenBalance");

        if (stakedAmountElement)
          stakedAmountElement.value = stakeInfoResult.data.stakedAmount;
        if (earnedTokensElement)
          earnedTokensElement.value = earnedTokensResult.data;
        if (unstakeRequestAmountElement)
          unstakeRequestAmountElement.value =
            stakeInfoResult.data.unstakeRequestAmount;

        // 更新代币余额显示
        if (fairTokenBalance) {
          fairTokenBalance.value = fairTokenBalanceResult.success
            ? fairTokenBalanceResult.balance
            : "0.00";
        }

        if (frTokenBalance) {
          frTokenBalance.value = frTokenBalanceResult.success
            ? frTokenBalanceResult.balance
            : "0.00";
        }

        // 更新解押倒计时，传入从合约获取的解除质押等待天数
        this.updateUnstakeCountdown(
          stakeInfoResult.data.unstakeRequestTime,
          stakeInfoResult.data.unstakeWaitDays
        );
      } else {
        console.error("获取用户质押信息失败:", stakeInfoResult.error);
        // 非自动刷新时才显示消息
        if (!isAutoRefresh && this.common) {
          this.common.showMessage(
            "error",
            "加载数据失败: " + stakeInfoResult.error
          );
        }
        return false;
      }

      if (!this.unstakeCountdownElement || !this.completeUnstakeButton) {
        return;
      }

      const countdownText =
        this.unstakeCountdownElement.value ||
        this.unstakeCountdownElement.textContent;
      console.log(`当前倒计时: ${countdownText}`);

      // 检查倒计时是否已完成
      const isCountdownComplete =
        countdownText === "已解锁" ||
        countdownText === "0" ||
        countdownText === "00:00:00" ||
        countdownText.toLowerCase().includes("已完成") ||
        countdownText.toLowerCase().includes("完成");

      // 更新按钮状态
      if (isCountdownComplete) {
        this.completeUnstakeButton.disabled = false;
        this.completeUnstakeButton.classList.remove("is-disabled");
      } else {
        this.completeUnstakeButton.disabled = true;
        this.completeUnstakeButton.classList.add("is-disabled");
      }
    } catch (error) {
      console.error("执行数据加载和更新时发生未预期的错误:", error);
      return false;
    } finally {
      // 自动刷新完成后，移除旋转效果
      if (isAutoRefresh && refreshBtn) {
        refreshBtn.classList.remove("fa-spin");
      }
      // 手动刷新完成后，隐藏加载图标
      else if (!isAutoRefresh) {
        const loadingIndicator = document.getElementById(
          "dataLoadingIndicator"
        );
        if (loadingIndicator) {
          loadingIndicator.classList.add("is-hidden");
        }
      }
    }
  }


   /**
   * 启动数据定时刷新功能
   * 每1分钟调用一次loadUserData方法，同时更新用户数据和全局统计
   */
  startDataRefreshTimer(time=10)  {
    const me=this;
    setTimeout(async () => {
      try {
        /*
        const refreshBtn = document.getElementById("refreshUserStatsBtn");
        if(!refreshBtn) { 
            this.clearDataRefreshTimer();
            return;
        }*/
       if(UserAccountModule.lastInstance===me){       
        // 调用合并方法同时更新用户数据和全局统计，传递isAutoRefresh=true参数
        await this.loadUserData(true);
       }else return;
      } catch (error) {
        console.error("定时刷新数据时出错:", error);
      }
      me.startDataRefreshTimer(10000);
    }, time);
  }

  
  /**
   * 更新解押倒计时
   * @param {string|number} requestTime - 解除质押请求时间戳
   * @param {number} unstakeWaitDays - 解除质押等待天数
   */
  updateUnstakeCountdown(requestTime, unstakeWaitDays = 30) {
    const unstakeCountdown = document.getElementById("unstakeCountdown");

    if (!unstakeCountdown || !requestTime) {
      return;
    }

    // 计算并显示剩余时间，传入解除质押等待天数
    const remaining = this.contractInteraction.calculateUnstakeTimeRemaining(
      requestTime,
      unstakeWaitDays
    );
    unstakeCountdown.value = remaining;

    // 根据是否已解锁更新按钮状态
    if (remaining === "已解锁" || remaining === "0") {
      if (this.completeUnstakeButton) {
        this.completeUnstakeButton.disabled = false;
        this.completeUnstakeButton.classList.remove("is-disabled");
      }
    } else {
      if (this.completeUnstakeButton) {
        this.completeUnstakeButton.disabled = true;
        this.completeUnstakeButton.classList.add("is-disabled");
      }
    }
  }
  /**
   * 初始化 DOM 元素引用
   */
  initDOMReferences() {
    // 获取其他必要的DOM元素引用
    this.quickStakeButton = document.getElementById("quickStakeButton");
    this.quickUnstakeButton = document.getElementById("quickUnstakeButton");
    this.quickClaimButton = document.getElementById("quickClaimButton");
    this.completeUnstakeButton = document.getElementById(
      "completeUnstakeButton"
    );

    // 获取倒计时元素引用
    this.unstakeCountdownElement = document.getElementById("unstakeCountdown");
  }

  /**
   * 初始化按钮事件监听器
   */
  initButtonEventListeners() {
    // 获取所有功能按钮
    this.quickStakeButton = document.getElementById("quickStakeButton");
    this.quickUnstakeButton = document.getElementById("quickUnstakeButton");
    this.completeUnstakeButton = document.getElementById(
      "completeUnstakeButton"
    );
    this.quickClaimButton = document.getElementById("quickClaimButton");
    this.exchangeButton = document.getElementById("exchangeButton");

    // 设置按钮事件监听
    if (this.quickStakeButton) {
      this.quickStakeButton.addEventListener("click", () => this.handleStake());
    }

    if (this.quickUnstakeButton) {
      this.quickUnstakeButton.addEventListener("click", () =>
        this.handleRequestUnstake()
      );
    }

    // completeUnstakeButton的事件绑定在setupBasicEventListeners中处理

    if (this.quickClaimButton) {
      this.quickClaimButton.addEventListener("click", () => this.handleClaim());
    }

    if (this.exchangeButton) {
      // 为交换按钮添加事件处理（如果实现了相应功能）
      this.exchangeButton.addEventListener("click", () =>
        console.log("交换按钮被点击")
      );
    }
  }
  /**
   * 处理质押功能 - 显示模态框让用户输入质押金额
   */
  handleStake() {
    try {
      // 显示质押模态框
      const stakeModal = document.getElementById("stakeModal");
      if (stakeModal) {
        // 移除readonly属性，允许用户输入
        const modalStakeAmount = document.getElementById("modalStakeAmount");
        if (modalStakeAmount) {
          modalStakeAmount.classList.remove("is-readonly");
          modalStakeAmount.removeAttribute("readonly");
          modalStakeAmount.value = ""; // 清空输入框
        }

        // 显示模态框
        stakeModal.classList.add("is-active");

        // 更新确认按钮事件
        const confirmButton = document.getElementById("confirmStake");
        if (confirmButton) {
          // 移除之前的事件监听器，防止多次绑定
          const newConfirmButton = confirmButton.cloneNode(true);
          confirmButton.parentNode.replaceChild(
            newConfirmButton,
            confirmButton
          );
          // 添加新的事件监听器
          newConfirmButton.addEventListener("click", () => this.confirmStake());
        }
      }
    } catch (error) {
      console.error("显示质押模态框出错:", error);
      this.common.showMessage("error", "显示质押模态框出错: " + error.message);
    }
  }

  // 领取FAIR代币
  async claimTestFairToken() {
    try {
      const claimBtn = document.getElementById("claimFairTokenBtn");
      claimBtn.disabled = true;
      claimBtn.textContent = "领取中...";
      // 调用mint50000IfBalanceLow方法领取代币，传入当前账户地址作为参数
      const result = await this.contractInteraction.claimTestFairToken(
        this.account
      );
      console.log("领取FAIR代币成功:", result);
      alert("领取FAIR代币成功！");

      // 刷新账户信息
      this.loadAccountInfo();
    } catch (error) {
      console.error("领取FAIR代币失败:", error);
      alert("领取FAIR代币失败: " + error.message);
    } finally {
      const claimBtn = document.getElementById("claimFairTokenBtn");
      claimBtn.disabled = false;
      claimBtn.textContent = "领取FAIR代币";
    }
  }

}

export default UserAccountModule;