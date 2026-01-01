/**
 * setTokenExchangeRate.js - Token Exchange Rate Proposal Module
 * Handles the creation of token exchange rate proposals in the governance system
 */

class SetTokenExchangeRate {
  constructor() {
    this.common = null;
    this.tronWebConnector = null;
    this.isOwner = false;
    this.network = null;
    this.selectedToken = null;
    this.app = null;
    this.selectedTokenType = 0; // 默认代币类型
  }

  /**
   * 初始化函数，在页面加载时调用
   */
  async init() {
    try {
      this.initElementReferences();
      this.common = window.fairStakeCommon;
      this.tronWebConnector = this.common.tronWebConnector;

      try {
        await this.i18n();
      } catch (ex) {
        console.log(ex);
      }

      this.initEventListeners();

      try {
        this.renderTokenList();
      } catch (error) {
        console.error("初始化代币列表失败:", error);
      }
    } catch (error) {
      console.error("初始化兑换管理模块失败:", error);
      this.common.showMessage(
        "error",
        "初始化兑换管理模块失败: " + (error.message || "未知错误")
      );
    }
  }

  /**
   * 初始化UI元素引用
   */
  initElementReferences() {
    this.elements = {
      tokenDecimals: document.getElementById("tokenDecimals"),
      contractTokenBalance: document.getElementById("contractTokenBalance"),
      tokenTypeInfo: document.getElementById("tokenTypeInfo"),
      selectedTokenInfo: document.getElementById("selectedTokenInfo"),

      setRateButton: document.getElementById("setRateButton"),
      tokenAddress: document.getElementById("tokenAddress"),
      targetTokenAmount: document.getElementById("targetTokenAmount"),
      frTokenAmount: document.getElementById("frTokenAmount"),
      maxExchangeAmount: document.getElementById("maxExchangeAmount"),
      durationWeeks: document.getElementById("durationWeeks"),
      proposalDescription: document.getElementById("proposalDescription"),

      tokenName: document.getElementById("tokenName"),
      maxExchangeTokenName: document.getElementById("maxExchangeTokenName"),
    };

    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.loadingMessage = document.getElementById("loadingMessage");
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    if (this.elements.setRateButton) {
      this.elements.setRateButton.addEventListener("click", () =>
        this.handleSetExchangeRate()
      );
    }

    if (this.elements.targetTokenAmount) {
      this.elements.targetTokenAmount.addEventListener("input", () =>
        this.validateExchangeRateForm()
      );
    }

    if (this.elements.frTokenAmount) {
      this.elements.frTokenAmount.addEventListener("input", () =>
        this.validateExchangeRateForm()
      );
    }

    if (this.elements.maxExchangeAmount) {
      this.elements.maxExchangeAmount.addEventListener("input", () =>
        this.validateExchangeRateForm()
      );
    }
  }

  /**
   * 获取代币类型标签
   * @param {number} tokenType - 代币类型
   * @returns {string} 代币类型标签
   */
  getTokenTypeLabel(tokenType) {
    const typeLabels = {
      0: "标准ERC20",
      1: "非标准ERC20",
      2: "TRX",
      3: "TRC10",
    };
    return typeLabels[tokenType] || "未知";
  }

  /**
   * 渲染可用代币列表
   */
  renderTokenList() {
    try {
      this.network = this.common.network;
      const tokenListContainer = document.getElementById("tokenList");
      tokenListContainer.innerHTML = "";

      if (
        this.network &&
        this.common.network.burnRewards &&
        this.common.network.burnRewards.length > 0
      ) {
        this.common.network.burnRewards.forEach((token) => {
          if (token.decimals >= 0) {
            const tokenCard = document.createElement("div");
            tokenCard.className = "card token-card";
            tokenCard.style.border = "2px solid #e0e0e0";
            tokenCard.style.borderRadius = "8px";
            tokenCard.style.padding = "1.5rem";
            tokenCard.style.transition = "all 0.2s";
            tokenCard.style.cursor = "pointer";
            tokenCard.style.display = "flex";
            tokenCard.style.alignItems = "center";
            tokenCard.style.justifyContent = "space-between";
            tokenCard.style.gap = "1rem";
            tokenCard.dataset.address = token.tokenAddress || token.address;
            tokenCard.dataset.symbol = token.symbol;
            tokenCard.dataset.decimals = token.decimals || 18;
            tokenCard.dataset.type = token.type || 0;

            tokenCard.addEventListener("click", () => {
              document.querySelectorAll(".token-card").forEach((card) => {
                card.style.borderColor = "#e0e0e0";
                card.style.backgroundColor = "";
              });
              tokenCard.style.borderColor = "#00d1b2";
              tokenCard.style.backgroundColor = "#f0fdfa";
              this.selectToken(token);
            });

            tokenCard.addEventListener("mouseenter", () => {
              if (!tokenCard.style.borderColor.includes("#00d1b2")) {
                tokenCard.style.borderColor = "#bdbdbd";
                tokenCard.style.backgroundColor = "#f5f5f5";
              }
            });
            tokenCard.addEventListener("mouseleave", () => {
              if (!tokenCard.style.borderColor.includes("#00d1b2")) {
                tokenCard.style.borderColor = "#e0e0e0";
                tokenCard.style.backgroundColor = "";
              }
            });

            const tokenInfo = document.createElement("div");
            tokenInfo.style.display = "flex";
            tokenInfo.style.alignItems = "center";
            tokenInfo.style.gap = "1rem";

            const icon = document.createElement("img");
            icon.src = token.icon;
            icon.alt = token.symbol + " icon";
            icon.style.width = "3rem";
            icon.style.height = "3rem";
            icon.style.borderRadius = "50%";

            const tokenDetails = document.createElement("div");
            const eId = token.address.replace(/[^a-zA-Z0-9]/g, "_");
            tokenDetails.innerHTML = `
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: bold;">${
              token.symbol
            }</h3>
            <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">${this.common.truncateAddress(
              token.tokenAddress || token.address
            )}</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
              <span class="tag is-info">精度:${token.decimals}</span>
              <span class="tag is-warning">类型:</span> <span>${this.getTokenTypeLabel(
                token.type || 0
              )}</span>
            </div>
          `;

            const balanceInfo = document.createElement("div");
            balanceInfo.id = `balance_${eId}`;
            balanceInfo.style.textAlign = "right";
            balanceInfo.innerHTML = `
            <div style="font-size: 0.85rem; color: #777; margin-bottom: 0.5rem;">合约余额</div>
            <div style="font-size: 1.1rem; font-weight: bold; color: #00d1b2;">加载中...</div>
          `;

            tokenInfo.appendChild(icon);
            tokenInfo.appendChild(tokenDetails);
            tokenCard.appendChild(tokenInfo);
            tokenCard.appendChild(balanceInfo);
            tokenListContainer.appendChild(tokenCard);
            this.fetchContractTokenBalance(token);
          }
        });

        console.log(
          "Token list rendered with tokens:",
          this.common.network.burnRewards.length
        );
      } else {
        console.warn("No tokens available for the current network");
        tokenListContainer.innerHTML =
          '<div class="notification is-warning">没有可用代币</div>';
      }
    } catch (error) {
      console.error("Error rendering token list:", error);
    }
  }

  /**
   * 选择代币
   */
  async selectToken(token) {
    try {
      this.selectedToken = token;
      this.elements.setRateButton.disabled = true;

      const tokenAddress = token.tokenAddress || token.address;

      this.elements.tokenAddress.value = tokenAddress;
      this.elements.selectedTokenInfo.textContent = `${
        token.symbol
      } (${this.common.truncateAddress(tokenAddress)})`;
      this.elements.tokenName.textContent = token.symbol;
      this.elements.maxExchangeTokenName.textContent = token.symbol;
      this.elements.setRateButton.disabled = false;
      await this.fetchTokenExchangeInfo(token);
    } catch (error) {
      console.error("选择代币失败:", error);
    }
  }

  /**
   * 获取合约中代币余额
   * @param {string} tokenAddress - 代币地址（TRX和TRC10类型可能不需要）
   * @param {string} balanceElementId - 显示余额的元素ID
   * @param {number} decimals - 代币精度
   * @param {number} tokenType - 代币类型
   */
  async fetchContractTokenBalance(token) {
    const eId = token.address.replace(/[^a-zA-Z0-9]/g, "_");
    const balanceElement = document.getElementById(`balance_${eId}`);
    const decElement = document.getElementById(`dec_${eId}`);
    try {
      const tronWeb = this.tronWebConnector.getTronWeb();
      const contractAddress = this.common.network.rewardToken.address;
      let balanceNum;

      switch (token.type) {
        case 0: // 标准ERC20
        case 1: // 非标准ERC20
          const tokenContract = await tronWeb.contract(
            this.common.config.abis.ierc20,
            token.address
          );
          const balance = await tokenContract.balanceOf(contractAddress).call();
          balanceNum =
            typeof balance === "bigint"
              ? Number(balance.toString())
              : Number(balance);
          token.balance = balanceNum;
          break;

        case 2: // TRX
          {
            const balance = await tronWeb.trx.getBalance(contractAddress);
            balanceNum =
              typeof balance === "bigint"
                ? Number(balance.toString())
                : Number(balance);
            token.balance = balanceNum;
          }
          break;    
        default:
          throw new Error(`不支持的代币类型: ${tokenType}`);
      }

      // 使用BigInt进行精确计算，避免浮点数误差和类型转换错误
      const formattedBalance = (
        Number(balanceNum) /
        10 ** Number(token.decimals)
      ).toFixed(6);

      if (balanceElement) {
        balanceElement.innerHTML = `
          <div style="font-size: 0.85rem; color: #777; margin-bottom: 0.5rem;">合约余额</div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #00d1b2;">${formattedBalance}</div>
        `;
      }

      const tokenAddress = token.tokenAddress || token.address;
      if (
        this.elements.contractTokenBalance &&
        this.selectedToken &&
        (this.selectedToken.tokenAddress || this.selectedToken.address) ===
          tokenAddress
      ) {
        this.elements.contractTokenBalance.textContent = formattedBalance;
      }
    } catch (error) {
      console.error("获取合约代币余额失败:", error);
      if (balanceElement) {
        balanceElement.innerHTML = `
          <div style="font-size: 0.85rem; color: #777; margin-bottom: 0.5rem;">合约余额</div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ff4444;">加载失败</div>
        `;
      }
    }
  }

  /**
   * 获取代币兑换信息
   */
  async fetchTokenExchangeInfo(token) {
    try {
      const targetTokenAmountEl = document.getElementById("targetTokenAmount");
      const frTokenAmountEl = document.getElementById("frTokenAmount");
      const maxExchangeAmountEl = document.getElementById("maxExchangeAmount");

      if (targetTokenAmountEl) targetTokenAmountEl.value = "加载中...";
      if (frTokenAmountEl) frTokenAmountEl.value = "加载中...";
      if (maxExchangeAmountEl) maxExchangeAmountEl.value = "加载中...";
      const result = await this.app.contractInteraction.contract.tokenExchangeInfo(token.tokenAddress || token.address)
        .call();

      if (result != null) {
        this.selectedToken.exchangeInfo = result;
        this.updateExchangeRateUI();
      } else {
        console.error("获取代币兑换信息失败:", result.error);
        if (targetTokenAmountEl) targetTokenAmountEl.value = "未设置兑换率";
        if (frTokenAmountEl) frTokenAmountEl.value = "未设置兑换率";
        if (maxExchangeAmountEl) maxExchangeAmountEl.value = "未设置兑换率";
      }
    } catch (error) {
      console.error("获取代币兑换信息时发生错误:", error);
    }
  }

  /**
   * 更新兑换率UI显示
   */
  updateExchangeRateUI() {
    try {
      if (!this.selectedToken.exchangeInfo) return;

      const targetTokenAmountEl = document.getElementById("targetTokenAmount");
      const frTokenAmountEl = document.getElementById("frTokenAmount");
      const maxExchangeAmountEl = document.getElementById("maxExchangeAmount");
      const tokenDecimalsValue = Number(
        this.selectedToken.exchangeInfo.rateNumerator
      );
      const frTokenDecimalsValue = Number(
        this.selectedToken.exchangeInfo.rateDenominator
      );
      const remainingAmountValue = Number(
        this.selectedToken.exchangeInfo.remainingExchangeAmount
      );

      const tokenDecimalsNum = Number(this.selectedToken.decimals);
      const rewardTokenDecimalsNum = Number(
        this.common.network.rewardToken.decimals
      );

      const tokenDecimals = tokenDecimalsValue / Math.pow(10, tokenDecimalsNum);
      const frTokenDecimals =
        frTokenDecimalsValue / Math.pow(10, rewardTokenDecimalsNum);
      const remainingAmount =
        remainingAmountValue / Math.pow(10, tokenDecimalsNum);

      if (targetTokenAmountEl)
        targetTokenAmountEl.value = tokenDecimals.toFixed(8);
      if (frTokenAmountEl) frTokenAmountEl.value = frTokenDecimals.toFixed(8);
      if (maxExchangeAmountEl)
        maxExchangeAmountEl.value = remainingAmount.toFixed(6);
    } catch (error) {
      console.error("更新兑换率UI时发生错误:", error);
    }
  }

  /**
   * 计算最大公约数 (GCD)
   */
  calculateGCD(a, b) {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * 验证表单
   */
  validateExchangeRateForm() {
    // 表单验证逻辑
  }

  /**
   * 检查是否可以执行操作
   */
  canPerformAction() {
    return true; // 操作权限检查
  }

  /**
   * 验证Tron地址
   */
  isValidTronAddress(address) {
    return true; // Tron地址验证
  }

  /**
   * 设置代币兑换率
   */
  async handleSetExchangeRate() {
    try {
      const confirmed = await this.common.showConfirmDialog(
        "确认设置代币汇率",
        "确定要设置新的代币汇率吗？此操作将影响系统中的代币兑换比例。"
      );

      if (!confirmed) {
        this.common.showMessage("info", "操作已取消");
        return;
      }

      if (!this.canPerformAction()) {
        return;
      }

      if (!this.selectedToken) {
        throw new Error("请先选择代币");
      }

      let tokenAddressStr = this.elements.tokenAddress.value.trim();
      const targetAmountNum = parseFloat(
        this.elements.targetTokenAmount.value.replace(/,/g, "")
      );
      const frAmountNum = parseFloat(
        this.elements.frTokenAmount.value.replace(/,/g, "")
      );
      const maxAmountNum = parseFloat(
        this.elements.maxExchangeAmount.value.replace(/,/g, "")
      );
      const transferTypeInt = this.selectedToken.type || 0; // 使用固化在burnRewards中的代币类型
      const durationWeeksInt = parseInt(this.elements.durationWeeks.value);

      if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的目标代币数量");
        this.elements.targetTokenAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.targetTokenAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(frAmountNum) || frAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的FR代币数量");
        this.elements.frTokenAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.frTokenAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(maxAmountNum) || maxAmountNum < 0) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.elements.maxExchangeAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.maxExchangeAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (!tokenAddressStr) {
        this.common.showMessage("error", "请选择代币");
        this.elements.tokenAddress.classList.add("is-danger");
        setTimeout(
          () => this.elements.tokenAddress.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (!this.isValidTronAddress(tokenAddressStr)) {
        this.common.showMessage("error", "选择的代币地址无效");
        this.elements.tokenAddress.classList.add("is-danger");
        setTimeout(
          () => this.elements.tokenAddress.classList.remove("is-danger"),
          3000
        );
        return;
      }

      const tokenDecimalsNum = parseInt(this.selectedToken.decimals);
      const rewardDecimalsNum = parseInt(
        this.common.network.rewardToken.decimals
      );
      const calculationAccuracy = 18;

      const targetScaledValue = BigInt(
        Math.round(targetAmountNum * 10 ** calculationAccuracy)
      );
      const frScaledValue = BigInt(
        Math.round(frAmountNum * 10 ** calculationAccuracy)
      );

      const greatestCommonDivisor = this.calculateGCD(
        frScaledValue,
        targetScaledValue
      );

      const tokenRate =
        (targetScaledValue / greatestCommonDivisor) *
        BigInt(10 ** tokenDecimalsNum);
      const frRate =
        (frScaledValue / greatestCommonDivisor) *
        BigInt(10 ** rewardDecimalsNum);

      const convertedMaxAmount = BigInt(
        Math.round(maxAmountNum * 10 ** tokenDecimalsNum)
      );

      if (frRate <= 0n || frRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的FR代币值超出有效范围");
        this.elements.frTokenAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.frTokenAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (tokenRate <= 0n || tokenRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的目标代币数值超出有效范围");
        this.elements.targetTokenAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.targetTokenAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (convertedMaxAmount < 0n) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.elements.maxExchangeAmount.classList.add("is-danger");
        setTimeout(
          () => this.elements.maxExchangeAmount.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (
        isNaN(transferTypeInt) ||
        transferTypeInt < 0 ||
        transferTypeInt > 2
      ) {
        this.common.showMessage("error", "无效的代币类型");
        return;
      }

      if (
        isNaN(durationWeeksInt) ||
        durationWeeksInt < 0 ||
        durationWeeksInt > 255
      ) {
        this.common.showMessage(
          "error",
          "请输入有效的持续周数（必须为非负数且不超过255周）"
        );
        this.elements.durationWeeks.classList.add("is-danger");
        setTimeout(
          () => this.elements.durationWeeks.classList.remove("is-danger"),
          3000
        );
        return;
      }

      const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);
      if (convertedMaxAmount > maxUint256) {
        throw new Error(
          `计算结果过大，超出合约支持的范围。请减小最大兑换数量。`
        );
      }
      
      // Get proposal description from textarea
      const proposalDescription = this.elements.proposalDescription 
        ? this.elements.proposalDescription.value.trim() 
        : "";
      
      if (!proposalDescription) {
        this.common.showMessage("error", "请输入提案说明");
        this.elements.proposalDescription.classList.add("is-danger");
        setTimeout(
          () => this.elements.proposalDescription.classList.remove("is-danger"),
          3000
        );
        return;
      }
      
      let c = await this.common.getDiamondContract();

      const result = await this.common.send(
        c,
        "fairdao_CreateSetTokenExchangeRateProposal",
        "正在设置代币汇率...",
        {},
        tokenAddressStr,
        tokenRate.toString(),
        frRate.toString(),
        convertedMaxAmount.toString(),
        transferTypeInt,
        durationWeeksInt,
        proposalDescription
      );

      this.common.showMessage("success", `交易成功: ${result.txId}`);
      await this.fetchTokenExchangeInfo(this.selectedToken);
    } catch (error) {
      console.error("设置汇率失败:", error);
      this.common.showMessage(
        "error",
        "设置代币汇率失败: " + (error.message || "未知错误")
      );
    }
  }
}

export default SetTokenExchangeRate;