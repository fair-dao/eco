/**
 * 主应用逻辑 - 最小可行版本
 */

class FairStakeApp {
  constructor() {
    this.tronWebConnector = window.tronWebConnector;
    this.logTypes = [
      "Transfer",
      "Mint",
      "Burn",
      "RewardClaimed",
      "Staked",
      "Unstaked",
      "Claim",
      "Burnt",
      "ContributorRewardMinted",
      "UnstakeRequested",
      "Paused",
      "Unpaused",
      "TokenExchanged",
    ];
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
    var dao = await import("/js/fairdao.js");
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
      this.common.showMessage(
        "error",
        this.fairdao.translator.translate("network.connect.error")
      );
    }
  }

  /**
   * 显示 合约日志
   * @param {Array} events 链上事件数组
   */
  displayContractLogs(tableId, events, fields) {
    if (!fields || fields.length === 0) {
      fields = [
        "user",
        "eventName",
        "frAmount",
        "to",
        "timestamp",
        "transactionId",
      ];
    }
    const table = document.getElementById(tableId);
    if (!table) return;
    let tableHeader = table.querySelector("thead");
    if (!tableHeader) {
      tableHeader = document.createElement("thead");
      let headerHTML = "";
      for (let field of fields) {
        let str = field;
        let index = str.indexOf(",");
        if (index > -1) {
          str = field.substring(0, index);
        }
        headerHTML += `<th data-i18n="logs.table.${str}"></th>`;
      }
      tableHeader.innerHTML = `<tr>${headerHTML}</tr>`;
      table.insertBefore(tableHeader, table.firstChild);
    }
    let tableBody = table.querySelector("tbody");
    if (!tableBody) {
      tableBody = document.createElement("tbody");
      table.appendChild(tableBody);
    }
    if (!events || events.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="has-text-centered" data-i18n="logs.noData">暂无操作记录</td></tr>';
    } else {
      // 按时间倒序排序
      const sortedEvents = events.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });

      let rows = "";
      for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        if (!this.logTypes.includes(event.eventName)) continue;

        event.aptAddress = this.common.formatHexAddressToBase58(
          event.aptAddress
        );
        if (event.result["user"] == null) {
          event.result["user"] = event.result["from"];
        }

        const txHash = event.transactionId || "N/A";
        // 格式化数量
        let amount = this.common.formatNumber(
          event.amount / Math.pow(10, 18),
          4
        );
        let eventName = event.eventName || "Unknown";
        let rowHTML = "<tr>";
        for (let strField of fields) {
          let field = strField;
          let fieldHtml = null;
          let arry = strField.split(",");
          if (arry.length > 1) {
            field = arry[0];
            for (let j = 0; j < arry.length; j++) {
              if (event.result[arry[j]] != null) {
                event.result[field]=event.result[arry[j]];
                break;
              }
            }
          }
          switch (field) {
            case "user":
              const user = this.common.formatHexAddressToBase58(
                event.result["user"]
              );
              fieldHtml = `<td>${user}</td>`;
              break;
            case "eventName":
              eventName = event.eventName || "Unknown";
              fieldHtml = `<td data-i18n="logs.eventNames.${eventName}"></td>`;
              break;
            case "frAmount":
            case "fairAmount":
            case "amount":
            case "value": //fair transfer amount
              const amount = this.common.formatNumber(
                event.result[field] / Math.pow(10, 18),
                4
              );
              fieldHtml = `<td>${amount}${(event.eventName==='Staked' || event.eventName==='UnstakeRequested') && field==='fairAmount' ?' ('+event.result["rate"]/100+'%)':''}</td>`;
              break;
            case "exchangeTokenAmount":
              let address = event.result["tokenAddress"];
              let tokenAmount = event.result[field];
              let token = null;
              if (address) {
                address = this.common.TronWeb.utils.address.fromHex(address);
                for (
                  let i = 0;
                  i < this.common.network.burnRewards.length;
                  i++
                ) {
                  let a = this.common.network.burnRewards[i];
                  if (a.address === address) {
                    token = a;
                    break;
                  }
                }
                if (token) {
                  tokenAmount = this.common.formatNumber(
                    tokenAmount / Math.pow(10, token.decimals),
                    4
                  );
                  fieldHtml = `<td>${tokenAmount} ${token.symbol}</td>`;
                  break;
                }
              }
              fieldHtml = `<td>${tokenAmount} N/A</td>`;
              break;
            case "amount":
              event.amount = this.common.formatNumber(
                event.amount / Math.pow(10, 18),
                4
              );
              fieldHtml = `<td>${amount}</td>`;
              break;
            case "transactionId":
              fieldHtml = `<td class="is-family-monospace"><a href="${
                this.common.network.browser
              }#/transaction/${txHash}" target="_blank">${this.common.formatTxHash(
                txHash
              )}</a></td>`;
              break;
            case "to":
              const to = this.common.formatHexAddressToBase58(
                event.result["to"]
              );
              fieldHtml = `<td>${to}</td>`;
              break;
            case "timestamp":
              const eventTime = event.timestamp
                ? new Date(event.timestamp)
                : null;
              const formattedTime = eventTime
                ? eventTime.toLocaleString()
                : "未知时间";
              fieldHtml = `<td>${formattedTime}</td>`;
              break;
            default:
              let val = event[field];
              if (val === undefined || val === null) {
                val = event.result[field] || "N/A";
              }
              fieldHtml = `<td>${val}</td>`;
              break;
          }
          rowHTML += fieldHtml;
        }
        rowHTML += "</tr>";
        rows += rowHTML;
      }
      tableBody.innerHTML = rows;
    }
    this.fairdao.i18nElement(table, this.fairdao.translator);
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
    if (this.common.network.name !== "MAINNET") {
      this.common.showMessage(
        "warning",
        this.fairdao.translator.translate("network.warnning")
      );
      return;
    }
  }

  /**
   * 处理钱包断开连接事件
   */
  handleWalletDisconnected() {
    this.account = null;
    this.updateWalletUI(false);
    this.common.showMessage(
      "warning",
      this.fairdao.translator.translate("network.disconnect")
    );

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
    console.log("Update Wallet UI connection state:",isConnected);
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
      if (isConnected) {
        const acc= this.common.tronWebConnector.getAccount();
        // 截断显示地址
        const shortAddress = this.truncateAddress(acc);
        walletAddress.textContent = `${this.common.network.name}: ${shortAddress}`;
        walletAddress.title = acc;

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
  // 如果地址栏路径里有模块id，则直接加载模块
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    const moduleId = hash.substring(2);
    fairdao.loadModule(moduleId);
  }else {
    // 否则加载默认模块
    fairdao.loadModule("home");
  }
 
});
