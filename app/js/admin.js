/**
 * FairStakeToken管理页面JavaScript
 * 实现合约管理功能，包括暂停/恢复合约、设置代币兑换率、铸造贡献者奖励等
 * 同时集成钻石合约管理功能，支持钻石切割操作、Facets管理、所有权管理等
 */

class FairStakeAdmin {
  constructor() {
    this.common = window.fairStakeCommon;
    this.contractInteraction=null; 
  }

  async init(){     
  
     // 确保正确获取合约交互模块
    if (!window.contractInteraction) {
      window.contractInteraction = new ContractInteraction(
        this.common.tronWebConnector
      );
      window.contractInteraction.init();
    }
    this.contractInteraction = window.contractInteraction || null;
    if (!this.contractInteraction) {
      console.warn("合约交互模块未在window对象中找到");
    }    
    window.fairStakeAdmin=this;
    this.fairStakeContract = null;
    this.diamondContract = null;
    this.isOwner = false;
    this.config = window.CONFIG;
    this.network = null;
    this.selectedToken = null;
    // 钻石合约相关变量
    this.diamondAddress = null;

    
    // 初始化UI元素引用
    this.initElementReferences();

    // 初始化事件监听器
    this.initEventListeners();

    // 初始化模块暂停控制功能
    this.initModuleControl();
  
  }

  /**
   * 初始化UI元素引用
   */
  initElementReferences() {
    // 钱包相关
    this.connectWalletBtn = document.getElementById("connectWallet");
    this.walletInfo = document.getElementById("walletInfo");
    this.walletAddress = document.getElementById("walletAddress");
    this.networkInfoEL = document.getElementById("networkInfo");
    // 合约状态
    this.contractAddressEl = document.getElementById("contractAddress");
    this.contractStatusEl = document.getElementById("contractStatus");
    this.pauseStatusEl = document.getElementById("pauseStatus");
    // 所有者地址和当前网络已移除

    // 合约控制按钮
    this.pauseButton = document.getElementById("pauseButton");
    this.unpauseButton = document.getElementById("unpauseButton");


    // 铸造奖励
    this.rewardAddressInput = document.getElementById("rewardAddress");
    this.rewardAmountInput = document.getElementById("rewardAmount");
    this.proposalId = document.getElementById("proposalId");
    this.contributionDescription = document.getElementById(
      "contributionDescription"
    );
    this.mintRewardButton = document.getElementById("mintRewardButton");

    // 合约统计信息相关元素（已移至合约状态卡片）
    this.totalSupplyEl = document.getElementById("totalSupply");
    this.totalStakedEl = document.getElementById("totalStaked");
    this.refreshStatsButton = document.getElementById("refreshStatsButton");

    // 通知元素
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.loadingMessage = document.getElementById("loadingMessage");
    this.errorNotification = document.getElementById("errorNotification");
    this.errorMessage = document.getElementById("errorMessage");
    this.successNotification = document.getElementById("successNotification");
    this.successMessage = document.getElementById("successMessage");
    
    // 钻石合约管理相关UI元素
    this.diamondAdminSection = document.getElementById("diamond-admin-section");
    this.navDiamondAdmin = document.getElementById("nav-diamond-admin");
    this.closeDiamondAdmin = document.getElementById("close-diamond-admin");
    
    
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    // 钱包连接事件
    this.connectWalletBtn.addEventListener("click", () =>
      this.handleConnectWallet()
    );

    // 钱包状态变化监听
    this.common.tronWebConnector.on(
      "connected",
      this.handleWalletConnected.bind(this)
    );
    this.common.tronWebConnector.on(
      "disconnected",
      this.handleWalletDisconnected.bind(this)
    );
    this.common.tronWebConnector.on(
      "networkChanged",
      this.handleNetworkChanged.bind(this)
    );
    this.common.tronWebConnector.on(
      "accountsChanged",
      this.handleAccountsChanged.bind(this)
    );

    // 合约控制按钮事件
    this.pauseButton.addEventListener("click", () =>
      this.handlePauseContract()
    );
    this.unpauseButton.addEventListener("click", () =>
      this.handleUnpauseContract()
    );




    // 铸造奖励事件
    this.mintRewardButton.addEventListener("click", () =>
      this.handleMintReward()
    );

    // 刷新统计信息事件
    this.refreshStatsButton.addEventListener("click", () =>
      this.fetchContractStats()
    );

    // 通知关闭按钮事件
    document
      .querySelector("#loadingIndicator .delete")
      ?.addEventListener("click", () => {
        this.loadingIndicator.classList.add("is-hidden");
      });
    document
      .querySelector("#errorNotification .delete")
      ?.addEventListener("click", () => {
        this.errorNotification.classList.add("is-hidden");
      });
    document
      .querySelector("#successNotification .delete")
      ?.addEventListener("click", () => {
        this.successNotification.classList.add("is-hidden");
      });
    
    // 钻石合约通知关闭按钮
    if (this.resultNotificationEl) {
      const deleteBtn = this.resultNotificationEl.querySelector(".delete");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => this.hideResultNotification());
      }
    }
  }


    /**
   * 处理暂停合约
   */
  async handlePauseContract() {
    try {
      // 显示确认对话框
      const confirmed = await this.common.showConfirmDialog(
        "确认暂停合约",
        "确定要暂停FairStake合约吗？这将暂时冻结所有用户操作。"
      );

      if (!confirmed) return;
      let fairStakeContract=this.admin.contractInteraction.contract;

      // 使用common.js的send方法调用合约，确保参数格式正确
      const result = await this.common.send(
        fairStakeContract,
        "pause",
        "正在暂停合约..."
      );

      // 显示交易成功消息
      this.common.showMessage(
        "success",
        `合约暂停成功！交易ID: ${result.txId}`
      );

      // 刷新合约状态
      this.updateContractStatus();
    } catch (error) {
      console.error("暂停合约失败:", error);
      this.common.showMessage(
        "error",
        `暂停合约失败: ${error.message || error}`
      );
    }
  }

  /**
   * 处理恢复合约
   */
  async handleUnpauseContract() {
    try {
      // 显示确认对话框
      const confirmed = await this.common.showConfirmDialog(
        "确认恢复合约",
        "确定要恢复FairStake合约吗？恢复后用户可以正常进行操作。"
      );

      if (!confirmed) return;

      // 获取当前账户
      const account = window.tronWebConnector.getAccount();

      // 使用common.js的send方法调用合约，确保参数格式正确
      const result = await this.common.send(
        this.fairStakeContract,
        "unpause",
        "正在恢复合约...",
        {
          from: account,
        }
        // unpause函数不需要额外参数
      );

      // 显示交易成功消息
      this.common.showMessage(
        "success",
        `合约恢复成功！交易ID: ${result.txId}`
      );

      // 刷新合约状态
      this.updateContractStatus();
    } catch (error) {
      console.error("恢复合约失败:", error);
      this.common.showMessage(
        "error",
        `恢复合约失败: ${error.message || error}`
      );
    }
  }


  /**
   * 处理钱包连接
   */
  async handleConnectWallet() {
    try {
      // 通过common对象调用showLoading函数
      this.common.showLoading("正在连接钱包...");
      const result = await this.common.tronWebConnector.connect();
      if (!result.success) {
        this.common.showMessage("error", "连接钱包失败: " + result.error);
      }
    } catch (error) {
      this.common.showMessage("error", "连接钱包时发生错误: " + error.message);
    } finally {
      this.common.hideLoading();
    }
  }

  /**
   * 处理钱包连接成功
   */
  async handleWalletConnected(data) {
    console.log("钱包连接成功1...");
    try {
      await this.common.changeNetwork();      
      // 获取当前网络信息
      this.networkInfoEL.textContent = this.common.network.name;
      // 手动触发网络变更事件
      this.handleNetworkChanged();
     
    } catch (error) {
      console.error("处理钱包连接时发生错误:", error);
      this.common.showMessage("error", "初始化合约失败: " + error.message);
    } finally {
      this.connectWalletBtn.classList.add("is-hidden");
    }
  }

  /**
   * 处理钱包断开连接
   */
  handleWalletDisconnected() {
    console.log("钱包断开...");
    this.walletInfo.classList.add("is-hidden");
    this.fairStakeContract = null;
    this.diamondContract = null;
    this.isOwner = false;
    this.diamondAddress = null;

    // 重置UI状态
    this.resetUI();
    
  }

  /**
   * 处理网络变化
   */
  async handleNetworkChanged() {
    console.log("钱包网络发生改变...");
    try {
      this.networkInfoEL.value = this.common.network.name;
      this.walletAddress.textContent = this.common.truncateAddress(this.common.tronWebConnector.getAccount());
      this.walletInfo.classList.remove("is-hidden");
      

      // 初始化合约
      await this.initContract();


      // 手动触发账号变更事件
      this.handleAccountsChanged();
      
      // 重置钻石合约相关状态
      this.diamondContract = null;
      this.diamondAddress = null;
    } catch (error) {
      console.error("处理网络变化时发生错误:", error);
    }
  }

  /**
   * 处理账户变更事件
   */
  async handleAccountsChanged(data) {
    console.log("账户发生变更...", data);
    let account = this.common.tronWebConnector.getAccount();
    try {
      // 如果账户为空，表示已断开连接
      if (!account) {
        this.handleWalletDisconnected();
        return;
      }
      // 更新UI显示新的账户地址
      this.walletAddress.textContent = this.common.truncateAddress(account);
      // 检查权限和更新UI
      await this.checkOwnerPermission();
      await this.updateContractStatus();
      await this.fetchContractStats();
    } catch (error) {
      console.error("处理账户变更时发生错误:", error);
      this.common.showMessage("error", "更新账户信息失败: " + error.message);
    }
  }

  /**
   * 初始化合约实例
   */
  async initContract() {
    try {
      const tronWeb = this.common.tronWebConnector.getTronWeb();
      if (!tronWeb) {
        throw new Error("TronWeb未初始化");
      }

      // 获取合约地址（从配置中获取或使用默认地址）
      const contractAddress = this.common.network.rewardToken.address;
      if (!contractAddress) {
        throw new Error("未找到合约地址");
      }

      // 更新合约地址显示
      this.contractAddressEl.value = contractAddress;
      this.fairStakeContract = await tronWeb.contract(
        this.config.abis.fairstake,
        contractAddress
      );
    } catch (error) {
      console.error("初始化合约失败:", error);
      throw error;
    }
  }



  /**
   * 检查所有者权限
   */
  async checkOwnerPermission() {
    try {
      if (!this.fairStakeContract) {
        return;
      }

      const currentAccount = this.common.tronWebConnector.getAccount();
      // 检查是否是所有者
      const isOwner = await this.fairStakeContract
        .checkIsOwner(currentAccount)
        .call();
      if (isOwner) {
        // 检查当前账户是否是所有者
        this.isOwner = true;
      }

      // 更新按钮状态
      this.updateButtonStates();
    } catch (error) {
      console.error("检查所有者权限失败:", error);
      this.common.showMessage("error", "检查权限失败: " + error.message);
    }
  }

  /**
   * 更新合约状态显示
   */
  async updateContractStatus() {
    try {
      if (!this.fairStakeContract) {
        return;
      }

      // 获取合约暂停状态
      const paused = await this.fairStakeContract.paused().call();

      // 更新UI显示
      if (paused) {
        this.contractStatusEl.textContent = "已暂停";
        this.contractStatusEl.classList.remove("is-active", "is-warning");
        this.contractStatusEl.classList.add("is-paused");
        this.pauseStatusEl.textContent = "暂停中";
      } else {
        this.contractStatusEl.textContent = "运行中";
        this.contractStatusEl.classList.remove("is-paused", "is-warning");
        this.contractStatusEl.classList.add("is-active");
        this.pauseStatusEl.textContent = "正常";
      }

      // 更新按钮状态
      this.updateButtonStates(paused);
    } catch (error) {
      console.error("更新合约状态失败:", error);
      this.common.showMessage("error", "获取合约状态失败: " + error.message);
    }
  }

  /**
   * 获取合约统计信息
   */
  async fetchContractStats() {
    try {
      if (!this.fairStakeContract) {
        return;
      }

      this.common.showLoading("正在获取合约统计信息...");

      // 获取总供应量
      const totalSupply = await this.fairStakeContract.totalSupply().call();
      // 处理BigInt类型转换
      const totalSupplyNum =
        typeof totalSupply === "bigint"
          ? Number(totalSupply.toString())
          : Number(totalSupply);
      const formattedTotalSupply = (
        totalSupplyNum / Math.pow(10, this.common.network.rewardToken.decimals)
      ).toFixed(2);
      this.totalSupplyEl.value = formattedTotalSupply;

      // 获取已质押总量
      const totalStaked = await this.fairStakeContract.totalStaked().call();
      // 处理BigInt类型转换
      const totalStakedNum =
        typeof totalStaked === "bigint"
          ? Number(totalStaked.toString())
          : Number(totalStaked);
      const formattedTotalStaked = (
        totalStakedNum / Math.pow(10, this.common.network.rewardToken.decimals)
      ).toFixed(2);
      this.totalStakedEl.value = formattedTotalStaked;
    } catch (error) {
      console.error("获取合约统计信息失败:", error);
      this.common.showMessage("error", "获取统计信息失败: " + error.message);
    } finally {
      this.common.hideLoading();
    }
  }


  /**
   * Handle minting contributor rewards
   */
  async handleMintReward() {
    try {    

      this.canPerformAction();
      // Validate inputs
      const rewardAddress = this.rewardAddressInput.value.trim();
      const rewardAmount = parseFloat(this.rewardAmountInput.value);
      const proposalId = parseInt(this.proposalId.value);
      const contributionDescription = this.contributionDescription.value.trim();

      let isValid = true;

      // Reset error states
      this.rewardAddressInput.classList.remove("is-danger");
      this.rewardAmountInput.classList.remove("is-danger");
      this.proposalId.classList.remove("is-danger");
      this.contributionDescription.classList.remove("is-danger");

      if (!this.isValidTronAddress(rewardAddress)) {
        this.common.showMessage("error", "请输入有效的波场地址");
        this.rewardAddressInput.classList.add("is-danger");
        isValid = false;
      }

      if (isNaN(rewardAmount) || rewardAmount <= 0) {
        this.common.showMessage("error", "请输入有效的奖励数量（必须为正数）");
        this.rewardAmountInput.classList.add("is-danger");
        isValid = false;
      }

      if (isNaN(proposalId) || proposalId <= 0) {
        this.common.showMessage("error", "请输入有效的提案ID（必须为正整数）");
        this.proposalId.classList.add("is-danger");
        isValid = false;
      }

      if (!contributionDescription || contributionDescription.length === 0) {
        this.common.showMessage("error", "请输入贡献描述");
        this.contributionDescription.classList.add("is-danger");
        isValid = false;
      }

      if (!isValid) {
        setTimeout(() => {
          this.rewardAddressInput.classList.remove("is-danger");
          this.rewardAmountInput.classList.remove("is-danger");
          this.proposalId.classList.remove("is-danger");
          this.contributionDescription.classList.remove("is-danger");
        }, 3000);
        return;
      }

      // Convert to contract precision using BigInt to avoid overflow
      const scaledAmount = BigInt(
        Math.floor(
          rewardAmount * Math.pow(10, this.common.network.rewardToken.decimals)
        )
      );

      // Ensure proposalId is handled properly as uint256
      const safeProposalId = parseInt(proposalId);

      // 获取当前账户
      const account = window.tronWebConnector.getAccount();

      // 使用common.js的send方法调用合约，确保参数格式正确
      const result = await this.common.send(
        this.fairStakeContract,
        "mintContributorReward",
        "正在铸造奖励，请签名确认...",
        {
          from: account,
        },
        rewardAddress,
        safeProposalId,
        scaledAmount.toString(),
        contributionDescription
      );

      // 显示交易成功消息
      this.common.showMessage(
        "success",
        `奖励发放成功！交易ID: ${result.txId.substring(0, 10)}...`
      );

      // Clear input fields
      this.rewardAddressInput.value = "";
      this.rewardAmountInput.value = "";
      this.proposalId.value = "";
      this.contributionDescription.value = "";

      await this.fetchContractStats();
    } catch (error) {
      console.error("铸造奖励失败:", error);
      let errorMessage = "铸造奖励失败";
      if (error.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "只有合约所有者可以执行此操作";
      } else if (error.message.includes("paused")) {
        errorMessage = "合约已暂停，无法执行此操作";
      } else {
        errorMessage += ": " + error.message;
      }
      this.common.showMessage("error", errorMessage);
    } finally {
      this.common.hideLoading();
    }
  }

  /**
   * 检查是否可以执行操作
   */
  canPerformAction() {
    if (!this.isOwner) {
      throw new Error("您不是合约所有者，无权限执行此操作");
    }

    if (!this.fairStakeContract) {
      throw new Error("合约未初始化，请先连接钱包");
    }
  }

  /**
   * 更新按钮状态
   */
  updateButtonStates(paused = null) {
    // 如果用户是所有者，则启用管理按钮
    const isOwner = this.isOwner;

    // 更新暂停/恢复按钮状态
    if (paused !== null) {
      this.pauseButton.disabled = !isOwner || paused;
      this.unpauseButton.disabled = !isOwner || !paused;
    }

    // 更新铸造奖励按钮状态
    this.mintRewardButton.disabled = !isOwner;


  }

  /**
   * 重置UI状态
   */
  resetUI() {
    // 重置合约状态显示
    this.contractStatusEl.textContent = "未知";
    this.contractStatusEl.className = "tag is-warning";
    this.pauseStatusEl.textContent = "未连接";
    this.connectWalletBtn.classList.remove("is-hidden");
    // 重置按钮状态
    this.updateButtonStates();

    // 清空统计信息
    this.totalSupplyEl.value = "";
    this.totalStakedEl.value = "";
    this.contractAddressEl.value = "";
  }

  /**
   * 初始化模块暂停控制功能
   */
  async initModuleControl() {
    try {
      // 等待合约交互模块初始化
      while (!window.contractInteraction) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 获取模块选择器
      const moduleSelect = document.getElementById("moduleSelect");
      const moduleStatus = document.getElementById("moduleStatus");
      const pauseModuleButton = document.getElementById("pauseModuleButton");
      const unpauseModuleButton = document.getElementById(
        "unpauseModuleButton"
      );

      // 检查钱包连接状态
      function checkWalletConnection() {
        const isConnected =
          window.tronWebConnector && window.tronWebConnector.getIsConnected();
        pauseModuleButton.disabled = !isConnected;
        unpauseModuleButton.disabled = !isConnected;
        return isConnected;
      }

      // 更新模块状态
      async function updateModuleStatus() {
        if (!checkWalletConnection()) {
          moduleStatus.value = "钱包未连接";
          moduleStatus.classList.remove("is-success", "is-danger");
          moduleStatus.classList.add("is-warning");
          return;
        }

        // 确保合约交互模块已初始化
        if (
          !window.contractInteraction ||
          typeof window.contractInteraction.isModulePaused !== "function"
        ) {
          moduleStatus.value = "合约未初始化";
          moduleStatus.classList.remove("is-success", "is-danger");
          moduleStatus.classList.add("is-warning");
          // 尝试初始化后重试
          if (window.initContractInteraction) {
            setTimeout(() => {
              console.log("尝试重新初始化合约交互模块...");
              window
                .initContractInteraction()
                .then(() => {
                  console.log("初始化完成，重试获取模块状态");
                  updateModuleStatus();
                })
                .catch((err) => {
                  console.error("重新初始化失败:", err);
                });
            }, 1000);
          }
          return;
        }

        const moduleId = parseInt(moduleSelect.value);
        let retryCount = 0;
        const maxRetries = 3;

        // 添加重试逻辑
        while (retryCount < maxRetries) {
          try {
            console.log(
              `尝试获取模块 ${moduleId} 状态 (尝试 ${
                retryCount + 1
              }/${maxRetries})`
            );
            const result = await window.contractInteraction.isModulePaused(
              moduleId
            );

            // 检查是否成功，包括带有默认值的成功响应
            if (result && result.success !== undefined) {
              if (result.isPaused) {
                moduleStatus.value = "已暂停";
                moduleStatus.classList.remove("is-success", "is-warning");
                moduleStatus.classList.add("is-danger");
                pauseModuleButton.disabled = true;
                unpauseModuleButton.disabled = false;
              } else {
                // 显示模块状态，并检查是否有警告信息
                if (result.warning) {
                  console.warn(result.warning);
                  moduleStatus.value = "正常运行（默认）";
                  moduleStatus.classList.remove("is-danger");
                  moduleStatus.classList.add("is-warning");
                } else {
                  moduleStatus.value = "正常运行";
                  moduleStatus.classList.remove("is-danger", "is-warning");
                  moduleStatus.classList.add("is-success");
                }
                pauseModuleButton.disabled = false;
                unpauseModuleButton.disabled = true;
              }
              return; // 成功获取状态，退出函数
            } else {
              console.error(`获取模块状态失败: ${result?.error || '未知错误'}`);
              retryCount++;

              if (retryCount < maxRetries) {
                console.log(`等待 ${retryCount * 1000}ms 后重试...`);
                await new Promise((resolve) =>
                  setTimeout(resolve, retryCount * 1000)
                );
              }
            }
          } catch (error) {
            console.error(`获取模块状态时发生异常:`, error);
            retryCount++;

            if (retryCount < maxRetries) {
              console.log(`等待 ${retryCount * 1000}ms 后重试...`);
              await new Promise((resolve) =>
                setTimeout(resolve, retryCount * 1000)
              );
            }
          }
        }

        // 所有重试都失败
        moduleStatus.value = "获取状态失败";
        moduleStatus.classList.remove("is-success", "is-danger");
        moduleStatus.classList.add("is-warning");
        // 添加定时重试机制，避免用户需要手动刷新页面
        setTimeout(updateModuleStatus, 5000);
      }

      // 暂停模块按钮点击事件
      pauseModuleButton.addEventListener("click", async function () {
        if (!checkWalletConnection()) return;

        const moduleId = parseInt(moduleSelect.value);
        try {
          window.fairStakeCommon.showLoading("正在暂停模块...");
          const result = await window.contractInteraction.pauseModule(moduleId);

          if (result.success) {
            window.fairStakeCommon.showSuccess("模块暂停成功！");
            await updateModuleStatus();
          } else {
            window.fairStakeCommon.showError(
              "模块暂停失败: " + (result.error || "未知错误")
            );
          }
        } catch (error) {
          window.fairStakeCommon.showError("操作失败: " + error.message);
        } finally {
          window.fairStakeCommon.hideLoading();
        }
      });

      // 恢复模块按钮点击事件
      unpauseModuleButton.addEventListener("click", async function () {
        if (!checkWalletConnection()) return;

        const moduleId = parseInt(moduleSelect.value);
        try {
          window.fairStakeCommon.showLoading("正在恢复模块...");
          const result = await window.contractInteraction.unpauseModule(
            moduleId
          );

          if (result.success) {
            window.fairStakeCommon.showSuccess("模块恢复成功！");
            await updateModuleStatus();
          } else {
            window.fairStakeCommon.showError(
              "模块恢复失败: " + (result.error || "未知错误")
            );
          }
        } catch (error) {
          window.fairStakeCommon.showError("操作失败: " + error.message);
        } finally {
          window.fairStakeCommon.hideLoading();
        }
      });
      // 模块选择变化时更新状态
      moduleSelect.addEventListener("change", updateModuleStatus);

      // 监听钱包连接状态变化
      if (window.tronWebConnector) {
        window.tronWebConnector.on("connected", updateModuleStatus);
        window.tronWebConnector.on("disconnected", updateModuleStatus);
      }

      // 初始加载时更新模块状态
      updateModuleStatus();
    } catch (error) {
      console.error("初始化模块控制失败:", error);
    }
  }

  /**
   * 验证波场地址
   */
  isValidTronAddress(address) {
    // 简单的波场地址验证（以T开头，长度为34的base58字符串）
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
  }
 

  
  /**
   * 使用 CREATE2 部署合约
   * @param {string} salt - 32 字节盐值（hex 字符串，带 0x）
   * @param {string} byteCode - 合约字节码（hex 字符串，带 0x）
   * @returns {Promise<string>} - 返回部署成功的合约地址
   */
  async deployContractWithCreate2(salt, byteCode,msg) {    
      this.canPerformAction();
      // 参数校验
      if (!/^0x[0-9a-fA-F]{64}$/.test(salt)) {
        throw new Error("salt 必须是 32 字节 hex 字符串（带 0x 前缀）");
      }
      if (!/^0x[0-9a-fA-F]+$/.test(byteCode)) {
        throw new Error("byteCode 必须是 hex 字符串（带 0x 前缀）");
      }
      const launcherAddress= this.common.network.launcherAddress;

      const tronWeb = this.common.tronWebConnector.getTronWeb();
      const launcherContract = await tronWeb.contract(
        [{ "inputs": [{ "internalType": "bytes32", "name": "salt", "type": "bytes32" }, { "internalType": "bytes", "name": "byteCode", "type": "bytes" }], "name": "deployContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }],
        launcherAddress
      );

      const account = this.common.tronWebConnector.getAccount();

      // 调用 deployContract(bytes32,bytes)
      const result = await this.common.send(
        launcherContract,
        "deployContract",
        msg || "正在使用 CREATE2 部署合约，请签名...",
        { from: account },
        salt,
        byteCode
      );
      if(result.state ==="ok"){
         const address = tronWeb.address.fromHex(result.data[0]);
         return address;
      }else throw new Error(result.msg);
  
  }


  /**
   * 从ABI中提取函数选择器
   * @param {Array} abi - 合约ABI
   * @returns {Array} - 函数选择器数组
   */
  extractFunctionSelectors(abi) {
    const selectors = [];
    
    abi.forEach(item => {
      if (item.type === 'function' && !item.constant) {
        selectors.push('0x'+item.Hash);
      }
    });
    
    return selectors;
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  // 等待TronWebConnector初始化完成
  setTimeout(async () => {
    const common = new Common();
    await common.init();
    const fairStakeAdmin = new FairStakeAdmin();
    await fairStakeAdmin.init();
  }, 100);
});
