// home-staking.js
/**
 * StakingModule - 处理质押与解押相关的功能
 * This module handles all staking and unstaking operations for the FAIR token system
 * 该模块处理 FAIR 代币系统的所有质押与解押操作
 */
class StakingModule {
  static lastInstance=null;
  constructor() {
    StakingModule.lastInstance=this;
    // 获取 tronWebConnector
    this.tronWebConnector = window.tronWebConnector;
    
    // 获取合约交互模块
    this.contractInteraction = window.contractInteraction;
    
    // 获取公共工具模块
    this.common = window.fairStakeCommon;
    this.functionButtons = [
      "quickStakeButton",
      "quickUnstakeButton",
      "quickClaimButton",
      "exchangeButton",
    ];
    this.refreshId="refreshStakingStatsBtn";
  }

  async init() {
    try{
        console.log("init staking module ...");
        try{
        await this.i18n();
        }catch(ex){
          console.log(ex);
        }

      // 初始化 DOM 元素引用
      this.initDOMReferences();

      // 初始化按钮事件监听器
      this.initButtonEventListeners();
      this.setupBasicEventListeners();
       this.startDataRefreshTimer();
             // 初始化模态框事件监听器
      this.initModalEventListeners();
      if(this.common.tronWebConnector.getAccount()){   
        // 启用其他功能按钮
        this.enableFunctionButtons();
      }else{
        this.disableFunctionButtons();
      }

      console.log("用户账户模块初始化完成");
      return true;
    } catch (error) {
      console.error("用户账户模块初始化错误:", error);
      return false;
    }


  }
  /**
   * 启用功能按钮
   */
  enableFunctionButtons() {
  
    this.functionButtons.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("is-disabled");
      }
    });
  }

  /**
   * 禁用功能按钮
   */
  disableFunctionButtons() {
   this.functionButtons.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = true;
        btn.classList.add("is-disabled");
      }
    });
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
    // 添加刷新按钮事件监听器
    const refreshStatsBtn = document.getElementById(this.refreshId);
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
    const refreshBtn = document.getElementById(this.refreshId);
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

        if (stakedAmountElement)
          stakedAmountElement.value = `${this.common.formatNumber(stakeInfoResult.data.stakedAmount)} / ${fairTokenBalanceResult.success ? this.common.formatNumber(fairTokenBalanceResult.balance) : "0.00"}`;
        if (earnedTokensElement)
          earnedTokensElement.value = `${this.common.formatNumber(earnedTokensResult.data)} / ${frTokenBalanceResult.success ? this.common.formatNumber(frTokenBalanceResult.balance) : "0.00"}`;
        if (unstakeRequestAmountElement)
          unstakeRequestAmountElement.value =
            stakeInfoResult.data.unstakeRequestAmount;     


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
        countdownText.toLowerCase().includes("完成") ||
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
       if(StakingModule.lastInstance===me){       
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
      if(unstakeCountdown.value ){
        unstakeCountdown.value = "";
      }
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
   * 处理完成解押功能
   */
  async handleCompleteUnstake() {
    try {
      // 调用合约完成提取
      const result = await this.contractInteraction.unstake();
      if (result.state === "ok") {
        this.common.showMessage("success", "提取完成!");
        // 重新加载所有数据
        this.loadUserData();
      } else {
        this.common.showMessage("error", "提取失败: " + result.msg);
      }
    } catch (error) {
      console.error("提取操作出错:", error);
      this.common.showMessage("error", "提取出错: " + error.message);
    }
  }

  /**
   * 处理领取奖励功能
   */
  async handleClaim() {
    try {
      // 调用合约领取奖励
      const result = await this.contractInteraction.claimReward();
      if (result.state === "ok") {
        this.common.showMessage("success", "奖励领取成功!");
        // 重新加载所有数据
        this.loadUserData();
      } else {
        this.common.showMessage("error", "领取奖励失败: " + result.msg);
      }
    } catch (error) {
      console.error("领取奖励操作出错:", error);
      this.common.showMessage("error", "领取奖励出错: " + error.message);
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
      const result = await this.contractInteraction.claimTestFairToken();
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
      claimBtn.innerHTML = '<i class="fas fa-plus-circle mr-1"></i>领取';
    }
  }
  
  /**
   * 确认质押操作
   */
  async confirmStake() {
    try {
      const modalStakeAmount = document.getElementById("modalStakeAmount");
      const amount = modalStakeAmount.value.trim();

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        this.common.showMessage("warning", "请输入有效的质押金额");
        return;
      }

      this.common.showMessage("info", `正在执行质押: ${amount} FAIR...`);

      // 调用合约进行质押
      const result = await this.contractInteraction.stake(amount);

      if (result.state === "ok") {
        this.common.showMessage("success", "质押成功!");
        modalStakeAmount.value = "";
        // 隐藏模态框
        const stakeModal = document.getElementById("stakeModal");
        if (stakeModal) {
          stakeModal.classList.remove("is-active");
        }
        // 重新加载所有数据
        this.loadUserData();
      } else {
        this.common.showMessage("error", "质押失败: " + result.msg);
      }
    } catch (error) {
      console.error("质押操作出错:", error);
      this.common.showMessage("error", "质押出错: " + error.message);
    }
  }

  /**
   * 处理申请解押功能 - 显示模态框让用户输入解押金额
   */
  handleRequestUnstake() {
    try {
      // 显示解押模态框
      const unstakeModal = document.getElementById("unstakeModal");
      if (unstakeModal) {
        // 移除readonly属性，允许用户输入
        const modalUnstakeAmount =
          document.getElementById("modalUnstakeAmount");
        if (modalUnstakeAmount) {
          modalUnstakeAmount.classList.remove("is-readonly");
          modalUnstakeAmount.removeAttribute("readonly");
          modalUnstakeAmount.value = ""; // 清空输入框
        }

        // 显示模态框
        unstakeModal.classList.add("is-active");

        // 更新模态框标题
        const modalTitle = unstakeModal.querySelector(".modal-card-title");
        if (modalTitle) {
          modalTitle.textContent = "申请解押";
        }

        // 更新确认按钮文本
        const confirmButton = document.getElementById("confirmUnstake");
        if (confirmButton) {
          confirmButton.textContent = "确认申请解押";
          // 移除之前的事件监听器，防止多次绑定
          const newConfirmButton = confirmButton.cloneNode(true);
          confirmButton.parentNode.replaceChild(
            newConfirmButton,
            confirmButton
          );
          // 添加新的事件监听器
          newConfirmButton.addEventListener("click", () =>
            this.confirmRequestUnstake()
          );
        }
      }
    } catch (error) {
      console.error("显示解押模态框出错:", error);
      this.common.showMessage("error", "显示解押模态框出错: " + error.message);
    }
  }

  /**
   * 确认申请解押
   */
  async confirmRequestUnstake() {
    try {
      const modalUnstakeAmount = document.getElementById("modalUnstakeAmount");
      const amount = modalUnstakeAmount.value.trim();

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        this.common.showMessage("warning", "请输入有效的解押金额");
        return;
      }

      // 获取用户选择的等待期
      const unstakeWaitDays = parseInt(
        document.getElementById("unstakeWaitDays").value
      );
      if (
        isNaN(unstakeWaitDays) ||
        unstakeWaitDays < 15 ||
        unstakeWaitDays > 60
      ) {
        this.common.showMessage("warning", "请选择有效的等待期");
        return;
      }

      // 验证解押数量不超过已质押数量
      const stakeInfoResult = await this.contractInteraction.getUserStakeInfo(
        this.account
      );
      if (stakeInfoResult.success) {
        const stakedAmount = parseFloat(stakeInfoResult.data.stakedAmount);
        const requestedUnstakeAmount = parseFloat(amount);

        if (requestedUnstakeAmount > stakedAmount) {
          this.common.showMessage("warning", "解押数量不能超过已质押的数量");
          return;
        }
      }

      this.common.showMessage(
        "info",
        `正在申请解押: ${amount} FAIR... (等待期: ${unstakeWaitDays}天)`
      );

      // 调用合约申请解押，传递等待期参数
      const result = await this.contractInteraction.requestUnstake(
        amount,
        unstakeWaitDays
      );

      // 隐藏模态框
      this.closeUnstakeModal();

      if (result.state === "ok") {
        this.common.showMessage("success", "申请解押成功! 等待解锁期结束...");
        // 重新加载所有数据
        this.loadUserData();
      } else {
        this.common.showMessage("error", "申请解押失败: " + result.msg);
      }
    } catch (error) {
      console.error("确认申请解押操作出错:", error);
      this.common.showMessage("error", "申请解押出错: " + error.message);
    }
  }

  /**
   * 关闭解押模态框
   */
  closeUnstakeModal() {
    const unstakeModal = document.getElementById("unstakeModal");
    if (unstakeModal) {
      unstakeModal.classList.remove("is-active");
    }
  }

  /**
   * 关闭质押模态框
   */
  closeStakeModal() {
    const stakeModal = document.getElementById("stakeModal");
    if (stakeModal) {
      stakeModal.classList.remove("is-active");
    }
  }

  /**
   * 关闭领取奖励模态框
   */
  closeClaimModal() {
    const claimModal = document.getElementById("claimModal");
    if (claimModal) {
      claimModal.classList.remove("is-active");
    }
  }
  /**
   * 初始化模态框事件监听器
   */
  initModalEventListeners() {
    try {
      // 初始化所有模态框的事件监听器
      const modals = [
        {
          id: "stakeModal",
          closeMethod: "closeStakeModal",
          closeBtnId: "closeStakeModal",
          cancelBtnId: "cancelStakeModal",
        },
        {
          id: "unstakeModal",
          closeMethod: "closeUnstakeModal",
          closeBtnId: "closeUnstakeModal",
          cancelBtnId: "cancelUnstakeModal",
        },
        {
          id: "claimModal",
          closeMethod: "closeClaimModal",
          closeBtnId: "closeClaimModal",
          cancelBtnId: "cancelClaimModal",
        },
      ];

      modals.forEach((modal) => {
        // 获取模态框元素
        const modalElement = document.getElementById(modal.id);
        if (!modalElement) return;

        // 为关闭按钮(X)添加事件监听器
        const closeBtn = document.getElementById(modal.closeBtnId);
        if (closeBtn) {
          closeBtn.addEventListener("click", () => this[modal.closeMethod]());
        }

        // 为取消按钮添加事件监听器
        const cancelBtn = document.getElementById(modal.cancelBtnId);
        if (cancelBtn) {
          cancelBtn.addEventListener("click", () => this[modal.closeMethod]());
        }

        // 为模态框背景添加点击事件，点击背景可以关闭模态框
        modalElement.addEventListener("click", (event) => {
          if (event.target === modalElement) {
            this[modal.closeMethod]();
          }
        });
      });
    } catch (error) {
      console.error("初始化模态框事件监听器出错:", error);
    }
  }
}
export default StakingModule;





