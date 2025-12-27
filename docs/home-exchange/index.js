/**
 * 销毁奖励功能模块
 * 从 index.html 和 app.js 中抽取，实现 FR 代币销毁兑换奖励功能
 */

class BurnRewardModule {
  constructor() {
    // 获取 tronWebConnector
    this.tronWebConnector = window.tronWebConnector;

    // 获取公共工具模块
    this.common = window.fairStakeCommon;

    // 获取国际化模块
    this.i18n = null;

    // 初始化 UI 元素引用（移除旧的下拉菜单相关引用）
    this.exchangeFrAmount = null;
    this.tokenListContainer = null; // 新增：代币列表容器

    // 存储兑换信息
    this.exchangeTokenInfo = null;

    // 初始化奖励代币选项
    this.rewardTokenOptions = [];
  }

  /**
   * 初始化销毁奖励功能模块
   */
  async init() {
    console.log("初始化销毁奖励功能模块...");

    try {
      // 初始化多语言支持
      try {
        await this.i18n();
      } catch (ex) {
        console.log(ex);
      }

      // 确保 DOM 完全加载
      if (document.readyState !== "complete") {
        console.log("等待 DOM 加载完成...");
        await new Promise((resolve) => {
          window.addEventListener("load", resolve);
        });
        console.log("DOM 加载完成");
      }
      this.initUIReferences();

      // 加载奖励代币选项
      this.loadRewardTokenOptions();

      // 设置FR数量输入框事件监听器
      this.setupFrAmountInputListener();

      // 设置刷新日志按钮事件监听器
      this.setupRefreshLogsButtonListener();

      // 初始加载链上操作日志
      await this.refreshChainOperationsLogs();

      // 加载FR代币余额
      await this.loadFrTokenBalance();

      console.log("销毁奖励功能模块初始化完成");
      return true;
    } catch (error) {
      console.error("销毁奖励功能模块初始化错误:", error);
      return false;
    }
  }

  /**
   * 加载FR代币余额
   */
  async loadFrTokenBalance() {
    try {
      const account = await this.tronWebConnector.getAccount();
      if (!account) {
        console.log("账户未连接");
        return;
      }

      // 确保合约实例已初始化
      if (!this.app.contractInteraction.isInitialized()) {
        console.log("合约未初始化");
        return;
      }

      const frTokenBalanceResult =
        await this.app.contractInteraction.getFrTokenBalance(account);
      if (frTokenBalanceResult.success) {
        const frBalanceElement = document.getElementById("frTokenBalance");
        if (frBalanceElement) {
          frBalanceElement.innerHTML = this.common.formatNumber(
            frTokenBalanceResult.balance
          );
        }
      } else {
        console.error("获取FR代币余额失败:", frTokenBalanceResult.error);
      }
    } catch (error) {
      console.error("加载FR代币余额时出错:", error);
    }
  }

  /**
   * 设置刷新日志按钮事件监听器
   */
  setupRefreshLogsButtonListener() {
    const refreshLogsBtn = document.getElementById("refreshLogsBtn");
    if (refreshLogsBtn) {
      refreshLogsBtn.addEventListener("click", async () => {
        await this.refreshChainOperationsLogs();
      });
    }
  }

  /**
   * 刷新链上操作日志
   * Refresh operations logs from blockchain
   */
  async refreshChainOperationsLogs() {
    try {
      const tronWeb = this.common.tronWebConnector?.getTronWeb();

      const logs = await this.app.contractInteraction.getEvents(
        this.common.network.rewardToken.address,
        ["TokenExchanged"]
      );
      this.app.displayContractLogs("contractAccountLogsTable", logs, [
        "user",
        "eventName",
        "frAmount",
        "exchangeTokenAmount",
        "timestamp",
        "transactionId",
      ]);
    } catch (error) {
      console.error("刷新链上操作日志失败:", error);
      if (this.common) {
        this.common.showMessage("error", "刷新操作日志失败");
      }
    }
  }

  /**
   * 初始化 UI 元素
   */
  initUIReferences() {
    // 初始化代币列表容器
    this.tokenListContainer = document.getElementById("tokenListContainer");

    if (this.tokenListContainer) {
      console.log("找到代币列表容器");
    } else {
      console.log("未找到代币列表容器");
    }
  }

  /**
   * 加载奖励代币选项
   */
  async loadRewardTokenOptions() {
    try {
      // 检查是否有代币列表容器
      if (!this.tokenListContainer) {
        console.log("[BurnRewardModule] - tokenListContainer not found");
        return;
      }

      const rewardTokens = this.common.network.burnRewards;

      // 清空代币列表容器
      this.tokenListContainer.innerHTML = "";

      // 遍历并加载每个奖励代币的信息
      for (let i = 0; i < rewardTokens.length; i++) {
        const token = rewardTokens[i];
        try {
          token.exchangeInfo = null;
          this.createTokenCard(token);
        } catch (error) {
          console.log(
            `[BurnRewardModule] - Error loading token ${token.symbol}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "[BurnRewardModule] - loadRewardTokenOptions error:",
        error
      );
    }
  }

  /**
   * 创建单个代币卡片
   * @param {Object} tokenData - 代币数据
   */
  /**
   * Creates a token card for display in the reward tokens list
   * @param {Object} tokenData - Token data object containing configuration and properties
   * @returns {string} - HTML string for the token card
   */
  createTokenCard(token) {
    if (token) {
      const cardHTML = `
            <div class="card token-card" 
                 data-token-address="${token.address || ""}" 
                 style="border: 2px solid #e0e0e0; border-radius: 8px;transition: all 0.2s; align-items: center; justify-content: space-between;"
                 onmouseenter="this.style.borderColor='#bdbdbd'; this.style.backgroundColor='#f5f5f5';"
                 onmouseleave="this.style.borderColor='#e0e0e0'; this.style.backgroundColor='';"
                 onclick="
                   document.querySelectorAll('.token-card').forEach((card) => {
                     card.style.borderColor = '#e0e0e0';
                     card.style.backgroundColor = '';
                   });
                   this.style.borderColor = '#00d1b2';
                   this.style.backgroundColor = '#f0fdfa';
                 "
            >
                <div class="card-content" style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${token.icon}" alt="${
        token.symbol
      } icon" style="width: 3rem; border-radius: 50%;" />
                    <div style="width:100%">
                        <div class="is-flex is-justify-content-space-between has-text-weight-bold"><div>${
                          token.symbol || "Unknown"
                        }</div><div class="rate"></div></div>
                        <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">${this.common.truncateAddress(
                          token.address
                        )}</p>
                        <div class="is-flex is-justify-content-space-between"><div data-i18n="exchange.contractBalance"></div><div class="balance"></div></div>
                        <div class="token-exchange-info is-flex-wrap-wrap mt-2 is-gap-4 is-hidden">     
                        </div>
                    </div>
                </div>
                 <div class="card-footer exchangeRate is-hidden">
                    <div class="card-footer-item remainingAmount has-text-centered" style="display: block;"></div>       
      <button class="card-footer-item"  disabled
                            data-token-address="${token.address || ""}" 
                            data-symbol="${token.symbol || ""}">
                        <span class="icon"><i class="fas fa-exchange-alt"></i></span>
                        <span>Exchange</span>
                    </button>
  </div>
            
            </div>
        `;
      this.tokenListContainer.innerHTML += cardHTML;
      if (!token.exchangeInfo) {
        let curToken = token;
        const trans = this.translator;
        setTimeout(async () => {
          if (curToken.type == 2) {
            // 获取TRX余额
            curToken.balance = await this.app.contractInteraction.getTRXBalance(
              this.common.network.rewardToken.address
            );
          } else {
            // 获取ERC20余额
            curToken.balance = await this.app.contractInteraction.getERC20Balance(
              token.address,
              this.common.network.rewardToken.address
            );
          }

          let card = document.querySelector(
            `.token-card[data-token-address="${curToken.address}"]`
          );
          card.querySelector(".balance").textContent = curToken.balance;
          const tokenExchangeInfo = card.querySelector(".token-exchange-info");
          const exchangeRateEl = card.querySelector(".exchangeRate");
          // 获取兑换信息
          let exchangeInfo =
            await this.app.contractInteraction.getTokenExchangeInfo(curToken);
          curToken.exchangeInfo = exchangeInfo;
          if (exchangeInfo.success) {
            const data = exchangeInfo.data;
            // 格式化日期时间
            const formatTimestamp = (timestamp) => {
              const date = new Date(parseInt(timestamp) * 1000);
              return date.toLocaleString();
            };

            let frDecimals = data.frDecimals;
            let tokenDecimals = data.tokenDecimals;

            // 计算兑换率（分子/分母），考虑小数位数
            // 使用BigInt处理大数值，避免uint88类型的精度丢失
            const rateNumerator = BigInt(data.rateNumerator);
            const rateDenominator = BigInt(data.rateDenominator);

            // 计算调整后的兑换率，考虑两个币种的小数位数差异
            let exchangeRate = 0;
            if (rateDenominator > 0n) {
              // 基础兑换率 - 由于JavaScript处理大数值除法的限制，我们需要特殊处理
              // 首先将结果转换为字符串，然后处理小数
              // 这里简化处理，因为最终我们需要的是一个显示用的小数值
              const baseRate =
                parseFloat(data.rateNumerator) /
                parseFloat(data.rateDenominator);

              // 考虑小数位数差异进行调整
              // 如果FR代币小数位数为18，目标代币小数位数为6，那么1 FR = baseRate * (10^6 / 10^18) 目标代币
              // 反之亦然
              const decimalsAdjustment = Math.pow(
                10,
                frDecimals - tokenDecimals
              );
              exchangeRate = baseRate * decimalsAdjustment;
            }
            exchangeRate = exchangeRate.toFixed(4);

            // 计算人类可读的剩余兑换量，除以目标代币的精度系数
            const humanReadableRemainingAmount =
              parseFloat(data.remainingExchangeAmount) /
              Math.pow(10, tokenDecimals);
            let exchangeRateSpan = card.querySelector(".rate");
            exchangeRateSpan.setAttribute("rate", exchangeRate);
            exchangeRateSpan.innerHTML = `${exchangeRate} / FR`;
            let remainingAmount = card.querySelector(".remainingAmount");
            remainingAmount.innerHTML = `<div data-i18n="exchange.remainingAmount">剩余</div><div>${humanReadableRemainingAmount.toFixed(
              6
            )}</div>`;
            const curTime = Date.now() / 1000;
            const start = parseInt(data.startTime);
            const end = parseInt(data.endTime);
            let time = start - curTime;
            if (time > 0) {
              const minutes = Math.floor(time / 60);
              tokenExchangeInfo.innerHTML = `<span data-i18n='exchange.start'></span>${minutes} <span data-i18n='exchange.minutes'></span>`;
            } else {
              debugger
              time = end - curTime;
              if (time > 0) {
                tokenExchangeInfo.innerHTML = `<span data-i18n='exchange.endTime'></span> ${formatTimestamp(
                  data.endTime
                )}`;
                const button = card.querySelector("button");
                button.addEventListener("click", (e) => {
                  const tokenAddress =
                    button.getAttribute("data-token-address");
                  this.handleTokenExchange(tokenAddress);
                });
                button.disabled = false;
              } else {
                tokenExchangeInfo.innerHTML =
                  "<span data-i18n='exchange.end'>已结束</span>";
              }
            }
            
            tokenExchangeInfo.classList.add("is-flex");
            exchangeRateEl.classList.remove("is-hidden");
          } else {
            tokenExchangeInfo.innerHTML =
              "<span data-i18n='exchange.notOpen'>未开通兑换</span>";
          }
          this.fairdao.i18nElement(card, trans);
        }, 10);
      }
    }
  }

  /**
   * 处理单个代币的兑换操作
   * @param {string} tokenAddress - 代币地址
   */
  async handleTokenExchange(tokenAddress) {
    try {
      // 获取输入的FR数量
      const exchangeAmount = this.exchangeFrAmount?.value.trim();
      if (
        !exchangeAmount ||
        isNaN(exchangeAmount) ||
        parseFloat(exchangeAmount) <= 0
      ) {
        this.common.showMessage("warning", "请输入有效的交换数量");
        return;
      }

      // 找到对应的代币配置
      const token = this.common.network.burnRewards.find(
        (item) => item.address === tokenAddress
      );

      const tokenSymbol = token.symbol;
      this.common.showMessage("info", `正在销毁FR并兑换${tokenSymbol}...`);

      // 调用合约进行交换
      const result = await this.app.contractInteraction.exchangeFRForToken(
        tokenAddress,
        exchangeAmount
      );

      if (result.state === "ok") {
        this.common.showMessage("success", "代币交换成功!");
        // 交换成功后刷新FR代币余额
        await this.loadFrTokenBalance();
        // 刷新代币列表
        await this.loadRewardTokenOptions();
      } else {
        this.common.showMessage("error", "代币交换失败: " + result.msg);
      }
    } catch (error) {
      console.error("代币交换操作出错:", error);
      this.common.showMessage("error", "代币交换出错: " + error.message);
    }
  }

  /**
   * 设置FR数量输入框事件监听器
   */
  setupFrAmountInputListener() {
    this.exchangeFrAmount = document.getElementById("exchangeFrAmount");
    if (!this.exchangeFrAmount) return;

    // 监听输入变化
    this.exchangeFrAmount.addEventListener("input", () => {
      // 对于列表方式，我们不需要根据单个选择的代币来更新状态
      // 保持基本的数量验证逻辑
      const strFrAmount = this.exchangeFrAmount.value.trim();
      if (!strFrAmount || isNaN(strFrAmount) || parseFloat(strFrAmount) <= 0) {
        console.log("请输入有效的FR数量");
      }
      // 计算并显示根据当前汇率可兑换的目标代币数量
      const frAmount = parseFloat(strFrAmount);
      if (!isNaN(frAmount) && frAmount > 0) {
        document.querySelectorAll(".token-card").forEach((card) => {
          const exchangeRateSpan = card.querySelector(".rate");
          const exchangeRate = exchangeRateSpan?.getAttribute("rate");
          if (!exchangeRate) return;
          const rateText = exchangeRateSpan?.textContent || "";
          const rate = parseFloat(exchangeRate);
          const canGet = (frAmount * rate).toFixed(6);
          const remainingEl = card.querySelector(".remainingAmount");
          if (remainingEl) {
            remainingEl.innerHTML = `<div data-i18n="exchange.canGet"></div><div>${canGet}</div>`;
          }

          this.fairdao.i18nElement(card, this.translator);
        });
      }
    });
  }
}

export default BurnRewardModule;
