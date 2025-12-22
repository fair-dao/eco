/**
 * 代币兑换率设置功能模块
 * 负责处理代币兑换率的设置和显示
 */

class ExchangeAdmin {
  constructor() {    
    this.common = null;
    this.tronWebConnector = null;
    this.isOwner = false;
    this.network = null;
    this.selectedToken = null;
    this.app=null;
    
  }

  /**
   * 初始化函数，在页面加载时调用
   */
  async init() {
    try {
      // 初始化UI元素引用
    this.initElementReferences();
      this.common=window.fairStakeCommon;
      this.admin=window.fairStakeAdmin;
      this.tronWebConnector=this.common.tronWebConnector;
      console.log("Initializing Exchange Admin module...");
      // 初始化事件监听器
      this.initEventListeners();
      
      // 检查钱包连接状态
      if (this.tronWebConnector.isConnected) {
        await this.handleWalletConnected();
      }
      
      // 初始化代币下拉组件      
      try {
        this.initTokenAddressDropdown();
      } catch (error) {
        console.error("初始化代币列表失败:", error);
      }
      
    } catch (error) {
      console.error("初始化兑换管理模块失败:", error);
      this.common.showMessage("error", "初始化兑换管理模块失败: " + (error.message || "未知错误"));
    }
  }

  /**
   * 处理代币地址变更，获取代币精度和合约持有数量
   */
  async handleTokenAddressChange() {
    try {
      this.toggleDropdown();
      this.selectedToken = null;
      // 从select元素获取代币地址
      let tokenAddress = "";
      if (this.tokenAddressInput) {
        tokenAddress = this.tokenAddressInput.value.trim();
      }

      // 清空之前的显示
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = "加载中...";
      }
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = "加载中...";
      }

      if (!tokenAddress || !this.isValidTronAddress(tokenAddress)) {
        if (this.tokenDecimalsEl) {
          this.tokenDecimalsEl.textContent = "请选择代币";
        }
        if (this.contractTokenBalanceEl) {
          this.contractTokenBalanceEl.textContent = "请选择代币";
        }
        return;
      }

      let selectedToken = null;
      let len = this.common.network.burnRewards.length;
      for (let i = 0; i < len; i++) {
        let token = this.common.network.burnRewards[i];
        if (token.address == tokenAddress) {
          selectedToken = token;
          break;
        }
      }
      if (selectedToken) {
        this.updateTokenIcon(selectedToken.icon);
        // 获取代币精度和合约持有数量
        await this.fetchTokenInfo(selectedToken);
      }
    } catch (error) {
      console.error("处理代币地址变更时发生错误:", error);
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = "获取失败";
      }
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = "获取失败";
      }
    }
  }

  /**
   * 更新代币图标显示
   * @param {string|null} iconUrl - 代币图标URL，如果为null则隐藏图标
   */
  updateTokenIcon(iconUrl) {
    if (this.selectedTokenIconImg) {
      if (iconUrl) {
        this.selectedTokenIconImg.src = iconUrl;
        this.selectedTokenIconImg.style.display = "block";
      } else {
        this.selectedTokenIconImg.src = "";
        this.selectedTokenIconImg.style.display = "none";
      }
    }
  }

  /**
   * 获取代币精度和合约持有数量
   */
  async fetchTokenInfo(token) {
    try {
      const tronWeb = this.tronWebConnector.getTronWeb();
      if (!tronWeb) {
        throw new Error("未连接钱包或合约未初始化");
      }

      // 显示加载状态
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = "加载中...";
      }
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = "加载中...";
      }

      // 初始化代币合约实例
      const tokenContract = await tronWeb.contract(
        this.common.config.abis.ierc20,
        token.address
      );

      // 获取代币精度
      const decimals = await tokenContract.decimals().call();

      // 更新精度显示
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = decimals.toString();
        this.tokenDecimalsEl.classList.remove("is-danger");
      }

      // 获取合约地址
      const contractAddress = this.admin.contractInteraction.contractAddress;

      // 获取合约持有的代币数量
      const balance = await tokenContract.balanceOf(contractAddress).call();

      // 处理BigInt类型转换
      const balanceNum =
        typeof balance === "bigint"
          ? Number(balance.toString())
          : Number(balance);

      let decimalsNum = Number(decimals.toString());
      // 格式化余额
      const formattedBalance = (balanceNum / Math.pow(10, decimalsNum)).toFixed(
        6
      );

      // 更新余额显示
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = formattedBalance;
        this.contractTokenBalanceEl.classList.remove("is-danger");
      }
      token.decimals = decimals;
      token.balance = balanceNum;
      this.selectedToken = token;
      document.getElementById("tokenName").innerHTML =
        this.selectedToken.symbol;
      document.getElementById("maxExchangeTokenName").innerHTML =
        this.selectedToken.symbol;
      console.log(
        `获取代币信息成功: 精度=${token.decimals}, 合约余额=${formattedBalance}`
      );

      // 调用合约获取兑换信息
      await this.fetchTokenExchangeInfo(token);
    } catch (error) {
      console.error("获取代币信息失败:", error);
      // 显示错误信息
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = "获取失败";
        this.tokenDecimalsEl.classList.add("is-danger");
      }
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = "获取失败";
        this.contractTokenBalanceEl.classList.add("is-danger");
      }
    }
  }

  /**
   * 获取代币兑换信息
   * @param {string} tokenAddress - 代币地址
   */
  async fetchTokenExchangeInfo(token) {
    try {
      // 显示加载状态
      const targetTokenAmountEl = document.getElementById("targetTokenAmount");
      const frTokenAmountEl = document.getElementById("frTokenAmount");
      const maxExchangeAmountEl = document.getElementById("maxExchangeAmount");

      if (targetTokenAmountEl) targetTokenAmountEl.value = "加载中...";
      if (frTokenAmountEl) frTokenAmountEl.value = "加载中...";
      if (maxExchangeAmountEl) maxExchangeAmountEl.value = "加载中...";
      let fairStakeContract=this.admin.contractInteraction.contract;
      // 调用合约获取兑换信息
      const result = await fairStakeContract
        .tokenExchangeInfo(token.address)
        .call();

      if (result != null) {
        // 保存兑换信息
        this.selectedToken.exchangeInfo = result;

        // 计算兑换率并更新UI
        this.updateExchangeRateUI();
      } else {
        console.error("获取代币兑换信息失败:", result.error);
        // 显示错误信息
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

      // 更新UI
      const targetTokenAmountEl = document.getElementById("targetTokenAmount");
      const frTokenAmountEl = document.getElementById("frTokenAmount");
      const maxExchangeAmountEl = document.getElementById("maxExchangeAmount");
      // 正确处理BigInt运算，避免类型转换错误
      // 确保所有用于Math.pow的参数都是普通数字类型
      const tokenDecimalsValue = Number(
        this.selectedToken.exchangeInfo.rateNumerator
      );
      const frTokenDecimalsValue = Number(
        this.selectedToken.exchangeInfo.rateDenominator
      );
      const remainingAmountValue = Number(
        this.selectedToken.exchangeInfo.remainingExchangeAmount
      );

      // 将decimals转换为普通数字
      const tokenDecimalsNum = Number(this.selectedToken.decimals);
      const rewardTokenDecimalsNum = Number(
        this.common.network.rewardToken.decimals
      );

      // 执行计算
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

      // 如果有transferType下拉框，也更新其值
      const transferTypeEl = document.getElementById("transferType");
      if (transferTypeEl && this.selectedToken.exchangeInfo.transferType) {
        transferTypeEl.value = this.selectedToken.exchangeInfo.transferType;
      }
    } catch (error) {
      console.error("更新兑换率UI时发生错误:", error);
    }
  }


  /**
   * 计算最大公约数 (GCD)
   * @param {BigInt} a - 第一个数
   * @param {BigInt} b - 第二个数
   * @returns {BigInt} - 最大公约数
   */
  calculateGCD(a, b) {
    // 使用欧几里得算法计算最大公约数
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Process setting token exchange rate
   */
  async handleSetExchangeRate() {
    try {
      // 使用showConfirmDialog替代原生confirm
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

      // Get and process input values with decimal support
      const tokenAddressStr = this.tokenAddressInput.value.trim();
      const targetAmountNum = parseFloat(
        this.targetTokenAmountInput.value.replace(/,/g, "")
      );
      const frAmountNum = parseFloat(
        this.frTokenAmountInput.value.replace(/,/g, "")
      );
      const maxAmountNum = parseFloat(
        this.maxExchangeAmountInput.value.replace(/,/g, "")
      );
      const transferTypeInt = parseInt(this.transferTypeSelect.value);
      const durationWeeksInt = parseInt(this.durationWeeksInput.value);

      // Input validation
      if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的目标代币数量");
        this.targetTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.targetTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(frAmountNum) || frAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的FR代币数量");
        this.frTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.frTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(maxAmountNum) || maxAmountNum < 0) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.maxExchangeAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.maxExchangeAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Token validation
      if (!tokenAddressStr) {
        this.common.showMessage("error", "请选择代币");
        this.tokenAddressInput.classList.add("is-danger");
        setTimeout(
          () => this.tokenAddressInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (!this.isValidTronAddress(tokenAddressStr)) {
        this.common.showMessage("error", "选择的代币地址无效");
        this.tokenAddressInput.classList.add("is-danger");
        setTimeout(
          () => this.tokenAddressInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Get token decimals
      const tokenDecimalsNum = parseInt(this.selectedToken.decimals);
      const rewardDecimalsNum = parseInt(
        this.common.network.rewardToken.decimals
      );
      const calculationAccuracy = 18;

      // Convert to scaled values with decimal support
      const targetScaledValue = BigInt(
        Math.round(targetAmountNum * 10 ** calculationAccuracy)
      );
      const frScaledValue = BigInt(
        Math.round(frAmountNum * 10 ** calculationAccuracy)
      );

      // Calculate GCD
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

      // Convert max exchange amount with decimal support
      const convertedMaxAmount = BigInt(
        Math.round(maxAmountNum * 10 ** tokenDecimalsNum)
      );

      // Validate rate values
      if (frRate <= 0n || frRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的FR代币值超出有效范围");
        this.frTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.frTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (tokenRate <= 0n || tokenRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的目标代币数值超出有效范围");
        this.targetTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.targetTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Validate other parameters
      if (convertedMaxAmount < 0n) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.maxExchangeAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.maxExchangeAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (
        isNaN(transferTypeInt) ||
        transferTypeInt < 0 ||
        transferTypeInt > 1
      ) {
        this.common.showMessage("error", "请选择有效的代币类型");
        this.transferTypeSelect.classList.add("is-danger");
        setTimeout(
          () => this.transferTypeSelect.classList.remove("is-danger"),
          3000
        );
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
        this.durationWeeksInput.classList.add("is-danger");
        setTimeout(
          () => this.durationWeeksInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Check for overflow
      const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);
      if (convertedMaxAmount > maxUint256) {
        throw new Error(
          `计算结果过大，超出合约支持的范围。请减小最大兑换数量。`
        );
      }
      let fairStakeContract=this.admin.contractInteraction.contract;
      // 使用common.js的send方法调用合约
      const result = await this.common.send(
        fairStakeContract,
        "setTokenExchangeRate",
        "正在设置代币汇率...",
        {},
        tokenAddressStr,
        tokenRate.toString(),
        frRate.toString(),
        convertedMaxAmount.toString(),
        transferTypeInt,
        durationWeeksInt
      );

      this.common.showMessage("success", `交易成功: ${result.txId}`);
    } catch (error) {
      console.error("设置汇率失败:", error);
      this.common.showMessage(
        "error",
        "设置代币汇率失败: " + (error.message || "未知错误")
      );
    }
  }
  
  /**
   * 初始化代币地址下拉列表
   * 从配置的burnRewards中加载代币地址列表
   */
  initTokenAddressDropdown() {
    try {
      // 获取当前网络配置
      this.network = this.common.network;

      // 清空下拉列表
      this.tokenDropdownList.innerHTML = "";

      // 初始隐藏图标
      this.updateTokenIcon(null);

      // 检查是否有代币数据
      if (
        this.network &&
        this.common.network.burnRewards &&
        this.common.network.burnRewards.length > 0
      ) {
        // 遍历代币列表并添加到自定义下拉框
        this.common.network.burnRewards.forEach((token) => {
          const option = document.createElement("div");
          option.className = "custom-dropdown-option";
          option.style.display = "flex";
          option.style.alignItems = "center";
          option.style.padding = "12px 20px";
          option.style.cursor = "pointer";
          option.style.borderBottom = "1px solid #f0f0f0";
          option.style.transition = "background-color 0.2s";
          option.style.width = "100%";
          option.style.boxSizing = "border-box";

          // 添加图标
          const icon = document.createElement("img");
          icon.src = token.icon;
          icon.alt = token.symbol + " icon";
          icon.style.width = "1.5rem";
          icon.style.height = "1.5rem";
          icon.style.borderRadius = "50%";
          icon.style.marginRight = "10px";

          // 添加文本 - 使用truncateAddress函数简短显示地址
          const shortAddress = this.common.truncateAddress(token.address);
          const text = document.createTextNode(
            token.symbol + " (" + shortAddress + ")"
          );

          // 存储代币数据
          option.dataset.address = token.address;
          option.dataset.symbol = token.symbol;
          option.dataset.icon = token.icon;

          // 组装选项
          option.appendChild(icon);
          option.appendChild(text);

          // 添加点击事件
          option.addEventListener("click", () => {
            this.selectTokenOption(option);
          });

          // 鼠标悬停效果
          option.addEventListener("mouseenter", () => {
            option.style.backgroundColor = "#f5f5f5";
          });
          option.addEventListener("mouseleave", () => {
            option.style.backgroundColor = "";
          });

          this.tokenDropdownList.appendChild(option);
        });

        console.log(
          "Token dropdown initialized with tokens:",
          this.common.network.burnRewards.length
        );
      } else {
        console.warn("No tokens available for the current network");
      }
      // 确保可聚焦
      this.dropdownSelected.tabIndex = 0;
    } catch (error) {
      console.error("Error initializing token dropdown:", error);
    }
  }

  /**
   * 切换下拉框显示/隐藏
   */
  toggleDropdown() {
    if (this.tokenDropdownList.style.display === "block") {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * 打开下拉框
   */
  openDropdown() {
    this.tokenDropdownList.style.display = "block";
    // 旋转箭头
    const arrow = this.dropdownSelected.querySelector(".dropdown-arrow");
    if (arrow) {
      arrow.style.transform = "translateY(-50%) rotate(180deg)";
    }
  }

  /**
   * 关闭下拉框
   */
  closeDropdown() {
    this.tokenDropdownList.style.display = "none";
    // 恢复箭头
    const arrow = this.dropdownSelected.querySelector(".dropdown-arrow");
    if (arrow) {
      arrow.style.transform = "translateY(-50%)";
    }
  }

  /**
   * 高亮显示指定选项
   * @param {NodeList} options - 所有选项元素
   * @param {number} index - 要高亮的选项索引
   */
  highlightOption(options, index) {
    // 移除之前的高亮
    options.forEach((opt) => opt.classList.remove("selected", "bg-gray-50"));

    // 添加新的高亮
    const selectedOption = options[index];
    if (selectedOption) {
      selectedOption.classList.add("selected", "bg-gray-50");
      selectedOption.scrollIntoView({ block: "nearest" });
    }
  }

  /**
   * 选择代币选项
   * @param {HTMLElement} option - 选中的选项元素
   */
  selectTokenOption(option) {
    const address = option.dataset.address;
    const symbol = option.dataset.symbol;
    const icon = option.dataset.icon;

    // 更新隐藏的输入字段
    this.tokenAddressInput.value = address;

    // 更新选中项显示 - 使用truncateAddress函数简短显示地址
    const shortAddress = this.common.truncateAddress(address);
    this.selectedTokenText.textContent = symbol + " (" + shortAddress + ")";
    this.updateTokenIcon(icon);

    // 关闭下拉框
    this.closeDropdown();

    // 触发地址变更处理
    this.handleTokenAddressChange();
  }

  /**
   * 初始化UI元素引用
   */
  initElementReferences() {
    
    // 代币信息显示元素
    this.tokenDecimalsEl = document.getElementById("tokenDecimals");
    this.contractTokenBalanceEl = document.getElementById(
      "contractTokenBalance"
    );

    // 代币兑换率设置相关元素
    this.setRateButton = document.getElementById("setRateButton");
    this.tokenAddressInput = document.getElementById("tokenAddress");
    this.targetTokenAmountInput = document.getElementById("targetTokenAmount");
    this.frTokenAmountInput = document.getElementById("frTokenAmount");
    this.maxExchangeAmountInput = document.getElementById("maxExchangeAmount");
    this.transferTypeSelect = document.getElementById("transferType");
    this.durationWeeksInput = document.getElementById("durationWeeks");
    
    // 代币信息显示元素
    this.tokenDecimalsEl = document.getElementById("tokenDecimals");
    this.contractTokenBalanceEl = document.getElementById("contractTokenBalance");
    
    // 自定义下拉组件元素
    this.customDropdown = document.getElementById("customTokenDropdown");
    this.dropdownSelected = this.customDropdown ? this.customDropdown.querySelector(".custom-dropdown-selected") : null;
    this.tokenDropdownList = document.getElementById("tokenDropdownList");
    this.selectedTokenText = document.getElementById("selectedTokenText");
    this.selectedTokenIconImg = document.getElementById("selectedTokenIconImg");
    
    // 通知元素
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.loadingMessage = document.getElementById("loadingMessage");
  }

  /**
   * 初始化事件监听器
   */
  initEventListeners() {
    if (this.setRateButton) {
      this.setRateButton.addEventListener("click", () => this.handleSetExchangeRate());
    }
    
    if (this.dropdownSelected) {
      this.dropdownSelected.addEventListener("click", () =>{
         this.toggleDropdown();
        }        );
    }
    
    // 为输入框添加验证和实时计算功能
    if (this.targetTokenAmountInput) {
      this.targetTokenAmountInput.addEventListener("input", () => this.validateExchangeRateForm());
    }
    
    if (this.frTokenAmountInput) {
      this.frTokenAmountInput.addEventListener("input", () => this.validateExchangeRateForm());
    }
    
    if (this.maxExchangeAmountInput) {
      this.maxExchangeAmountInput.addEventListener("input", () => this.validateExchangeRateForm());
    }
    

    // 添加键盘交互
    this.customDropdown.addEventListener("keydown", (event) => {
      if (this.tokenDropdownList.style.display !== "block") return;

      const options = this.tokenDropdownList.querySelectorAll(
        ".custom-dropdown-option"
      );
      const currentIndex = Array.from(options).findIndex((opt) =>
        opt.classList.contains("selected")
      );

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          const nextIndex =
            currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          this.highlightOption(options, nextIndex);
          break;
        case "ArrowUp":
          event.preventDefault();
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          this.highlightOption(options, prevIndex);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (currentIndex >= 0) {
            this.selectTokenOption(options[currentIndex]);
          }
          break;
        case "Escape":
          this.closeDropdown();
          break;
      }
    });

    // 添加聚焦效果
    this.dropdownSelected.addEventListener("focus", () => {
      this.dropdownSelected.style.borderColor = "#4CAF50";
      this.dropdownSelected.style.boxShadow =
        "0 0 0 3px rgba(76, 175, 80, 0.1)";
    });

    this.dropdownSelected.addEventListener("blur", () => {
      this.dropdownSelected.style.borderColor = "#ddd";
      this.dropdownSelected.style.boxShadow = "none";
    });

    // 点击外部关闭下拉框
    document.addEventListener("click", (event) => {
      if (!this.customDropdown.contains(event.target)) {
        this.closeDropdown();
      }
    });

    // 表单输入事件监听
    const rateFormInputs = [
      this.tokenAddressInput,
      this.targetTokenAmountInput,
      this.frTokenAmountInput,
      this.maxExchangeAmountInput,
      this.transferTypeSelect,
      this.durationWeeksInput,
    ];

    rateFormInputs.forEach((input) => {
      if (input) {
        // 对于select元素，使用change事件
        if (input.tagName === "SELECT" && input.id === "tokenAddress") {
          input.addEventListener("change", async () => {
            await this.handleTokenAddressChange();
            this.validateRateForm();
          });
        } else if (input.tagName === "SELECT") {
          input.addEventListener("change", () => this.validateRateForm());
        } else {
          // 对于input元素，使用input和change事件
          input.addEventListener("input", () => this.validateRateForm());
          input.addEventListener("change", () => this.validateRateForm());
        }
      }
    });

  }

  /**
   * 初始化代币下拉组件
   */
  async initTokenDropdown() {
    try {
      // 从common.js获取代币列表
      if (this.common && this.common.getSupportedTokens) {
        const tokens = this.common.getSupportedTokens();
        this.renderTokenDropdown(tokens);
      }
    } catch (error) {
      console.error("初始化代币下拉组件失败:", error);
    }
  }

  /**
   * 渲染代币下拉列表
   */
  renderTokenDropdown(tokens) {
    if (!this.tokenDropdownList) return;
    
    this.tokenDropdownList.innerHTML = '';
    
    tokens.forEach(token => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      item.dataset.token = JSON.stringify(token);
      
      const icon = token.icon ? `<img src="${token.icon}" class="custom-dropdown-icon" />` : '';
      item.innerHTML = `
        ${icon}
        <div class="custom-dropdown-text">
          <span class="custom-dropdown-symbol">${token.symbol}</span>
          <span class="custom-dropdown-name">${token.name}</span>
        </div>
      `;
      
      item.addEventListener('click', () => {
        this.selectToken(token);
        this.toggleDropdown();
      });
      
      this.tokenDropdownList.appendChild(item);
    });
  }

  /**
   * 选择代币
   */
  async selectToken(token) {
    try {
      this.selectedToken = token;
      this.setRateButton.disabled = true;
      // 更新UI
      if (this.selectedTokenText) {
        this.selectedTokenText.textContent = `${token.symbol} - ${token.name}`;
      }
      
      if (this.selectedTokenIconImg && token.icon) {
        this.selectedTokenIconImg.src = token.icon;
        this.selectedTokenIconImg.style.display = 'inline-block';
      } else if (this.selectedTokenIconImg) {
        this.selectedTokenIconImg.style.display = 'none';
      }
      
      if (this.tokenAddressInput) {
        this.tokenAddressInput.value = token.address;
      }
      
      if (this.tokenDecimalsEl) {
        this.tokenDecimalsEl.textContent = token.decimals;
      }
      
      // 获取代币兑换信息
      await this.fetchTokenExchangeInfo(token);
      
      // 获取合约中代币余额
      await this.fetchContractTokenBalance(token.address);
      
    } catch (error) {
      console.error("选择代币失败:", error);
    }
  }

  
  /**
   * 验证兑换率表单
   */
  validateRateForm() {
    // 先检查是否是所有者    
    if (!this.admin.isOwner) {
      this.setRateButton.disabled = true;
      return;
    }

    // 验证表单字段
    const tokenAddress = this.tokenAddressInput?.value?.trim();
    const rateNumerator = parseFloat(this.targetTokenAmountInput?.value);
    const rateDenominator = parseFloat(this.frTokenAmountInput?.value);
    const maxExchangeAmount = parseFloat(this.maxExchangeAmountInput?.value);
    const transferType = parseInt(this.transferTypeSelect?.value);
    const durationWeeks = parseInt(this.durationWeeksInput?.value);

    // 检查所有必填字段是否有效
    const isTokenAddressValid =
      tokenAddress && this.isValidTronAddress(tokenAddress);
    const isRateNumeratorValid = !isNaN(rateNumerator) && rateNumerator > 0;
    const isRateDenominatorValid =
      !isNaN(rateDenominator) && rateDenominator > 0;
    const isMaxAmountValid =
      !isNaN(maxExchangeAmount) && maxExchangeAmount >= 0;
    const isTransferTypeValid =
      !isNaN(transferType) && transferType >= 0 && transferType <= 1;
    const isDurationValid = !isNaN(durationWeeks) && durationWeeks >= 0;

    // 只有当所有字段都有效时，启用按钮
    this.setRateButton.disabled = !(
      isTokenAddressValid &&
      isRateNumeratorValid &&
      isRateDenominatorValid &&
      isMaxAmountValid &&
      isTransferTypeValid &&
      isDurationValid
    );
  }


  /**
   * 切换下拉框显示状态
   */
  toggleDropdown() {
    if (!this.tokenDropdownList) return;
    
    this.tokenDropdownList.classList.toggle('is-active');
  }


  /**
   * 获取合约中代币余额
   */
  async fetchContractTokenBalance(tokenAddress) {
    try {
      let fairStakeContract=this.admin.contractInteraction.contract;
      // 使用common.js的方法获取余额
      if (this.common && this.common.getTokenBalance) {
        const balance = await this.common.getTokenBalance(tokenAddress, fairStakeContract.address);
        
        if (this.contractTokenBalanceEl && this.selectedToken) {
          const formattedBalance = this.common.formatTokenAmount(balance, this.selectedToken.decimals);
          this.contractTokenBalanceEl.textContent = formattedBalance;
        }
      }
    } catch (error) {
      console.error("获取合约代币余额失败:", error);
      if (this.contractTokenBalanceEl) {
        this.contractTokenBalanceEl.textContent = "加载失败";
      }
    }
  }

  /**
   * 更新兑换率UI显示
   */
  updateExchangeRateUI() {
    try {
      if (!this.selectedToken || !this.selectedToken.exchangeInfo) {
        // 设置默认显示
        if (this.targetTokenAmountInput) this.targetTokenAmountInput.value = "未设置兑换率";
        if (this.frTokenAmountInput) this.frTokenAmountInput.value = "未设置兑换率";
        if (this.maxExchangeAmountInput) this.maxExchangeAmountInput.value = "未设置兑换率";
        return;
      }

      // 正确处理BigInt运算，避免类型转换错误
      const tokenDecimalsValue = Number(this.selectedToken.exchangeInfo.rateNumerator);
      const frTokenDecimalsValue = Number(this.selectedToken.exchangeInfo.rateDenominator);
      const remainingAmountValue = Number(this.selectedToken.exchangeInfo.remainingExchangeAmount);

      // 将decimals转换为普通数字
      const tokenDecimalsNum = Number(this.selectedToken.decimals);
      const rewardTokenDecimalsNum = Number(this.common.network.rewardToken.decimals);

      // 执行计算
      const tokenDecimals = tokenDecimalsValue / Math.pow(10, tokenDecimalsNum);
      const frTokenDecimals = frTokenDecimalsValue / Math.pow(10, rewardTokenDecimalsNum);
      const remainingAmount = remainingAmountValue / Math.pow(10, tokenDecimalsNum);

      if (this.targetTokenAmountInput) this.targetTokenAmountInput.value = tokenDecimals.toFixed(8);
      if (this.frTokenAmountInput) this.frTokenAmountInput.value = frTokenDecimals.toFixed(8);
      if (this.maxExchangeAmountInput) this.maxExchangeAmountInput.value = remainingAmount.toFixed(6);

      // 更新转账类型下拉框
      if (this.transferTypeSelect && this.selectedToken.exchangeInfo.transferType !== undefined) {
        this.transferTypeSelect.value = this.selectedToken.exchangeInfo.transferType;
      }
    } catch (error) {
      console.error("更新兑换率UI时发生错误:", error);
    }
  }

  /**
   * 验证兑换率表单
   */
  validateExchangeRateForm() {
    if (!this.setRateButton) return;
    
    // 检查是否已选择代币
    if (!this.selectedToken) {
      this.setRateButton.disabled = true;
      return;
    }
    
    // 获取输入值
    const targetAmount = this.targetTokenAmountInput ? parseFloat(this.targetTokenAmountInput.value.replace(/,/g, "")) : 0;
    const frAmount = this.frTokenAmountInput ? parseFloat(this.frTokenAmountInput.value.replace(/,/g, "")) : 0;
    const maxAmount = this.maxExchangeAmountInput ? parseFloat(this.maxExchangeAmountInput.value.replace(/,/g, "")) : 0;
    
    // 验证输入值
    const isValid = !isNaN(targetAmount) && targetAmount > 0 && 
                   !isNaN(frAmount) && frAmount > 0 && 
                   !isNaN(maxAmount) && maxAmount >= 0;
    
    // 更新按钮状态
    this.setRateButton.disabled = !isValid || !this.isOwner;
  }

  /**
   * 处理钱包连接
   */
  async handleWalletConnected() {
    try {
      this.isOwner = this.admin.isOwner;
      // 如果已选择代币，重新获取兑换信息
      if (this.selectedToken) {
        await this.fetchTokenExchangeInfo(this.selectedToken);
        await this.fetchContractTokenBalance(this.selectedToken.address);
      }
      
    } catch (error) {
      console.error("处理钱包连接时发生错误:", error);
    }
  }

  /**
   * 处理钱包断开连接
   */
  handleWalletDisconnected() {
    this.isOwner = false;
    this.validateExchangeRateForm();
  }


  /**
   * 检查是否可以执行操作
   */
  canPerformAction() {
    if (!this.isOwner) {
      this.common.showMessage("error", "只有合约所有者可以执行此操作");
      return false;
    }
    
    if (!this.tronWebConnector.isConnected) {
      this.common.showMessage("error", "请先连接钱包");
      return false;
    }
    
    return true;
  }

  /**
   * 验证TRON地址
   */
  isValidTronAddress(address) {
    // 使用common.js中的验证方法或tronWeb的验证方法
    if (this.common && this.common.isValidAddress) {
      return this.common.isValidAddress(address);
    }
    
    // 基本验证
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
  }

  /**
   * 计算最大公约数 (GCD)
   * @param {BigInt} a - 第一个数
   * @param {BigInt} b - 第二个数
   * @returns {BigInt} - 最大公约数
   */
  calculateGCD(a, b) {
    // 使用欧几里得算法计算最大公约数
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * 处理设置代币兑换率
   */
  async handleSetExchangeRate() {
    try {
      // 使用showConfirmDialog替代原生confirm
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

      // Get and process input values with decimal support
      const tokenAddressStr = this.tokenAddressInput.value.trim();
      const targetAmountNum = parseFloat(
        this.targetTokenAmountInput.value.replace(/,/g, "")
      );
      const frAmountNum = parseFloat(
        this.frTokenAmountInput.value.replace(/,/g, "")
      );
      const maxAmountNum = parseFloat(
        this.maxExchangeAmountInput.value.replace(/,/g, "")
      );
      const transferTypeInt = parseInt(this.transferTypeSelect.value);
      const durationWeeksInt = parseInt(this.durationWeeksInput.value);

      // Input validation
      if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的目标代币数量");
        this.targetTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.targetTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(frAmountNum) || frAmountNum <= 0) {
        this.common.showMessage("error", "请输入有效的FR代币数量");
        this.frTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.frTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (isNaN(maxAmountNum) || maxAmountNum < 0) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.maxExchangeAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.maxExchangeAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Token validation
      if (!tokenAddressStr) {
        this.common.showMessage("error", "请选择代币");
        this.tokenAddressInput.classList.add("is-danger");
        setTimeout(
          () => this.tokenAddressInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (!this.isValidTronAddress(tokenAddressStr)) {
        this.common.showMessage("error", "选择的代币地址无效");
        this.tokenAddressInput.classList.add("is-danger");
        setTimeout(
          () => this.tokenAddressInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Get token decimals
      const tokenDecimalsNum = parseInt(this.selectedToken.decimals);
      const rewardDecimalsNum = parseInt(
        this.common.network.rewardToken.decimals
      );
      const calculationAccuracy = 18;

      // Convert to scaled values with decimal support
      const targetScaledValue = BigInt(
        Math.round(targetAmountNum * 10 ** calculationAccuracy)
      );
      const frScaledValue = BigInt(
        Math.round(frAmountNum * 10 ** calculationAccuracy)
      );

      // Calculate GCD
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

      // Convert max exchange amount with decimal support
      const convertedMaxAmount = BigInt(
        Math.round(maxAmountNum * 10 ** tokenDecimalsNum)
      );

      // Validate rate values
      if (frRate <= 0n || frRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的FR代币值超出有效范围");
        this.frTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.frTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (tokenRate <= 0n || tokenRate > BigInt(10 ** 256)) {
        this.common.showMessage("error", "计算后的目标代币数值超出有效范围");
        this.targetTokenAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.targetTokenAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Validate other parameters
      if (convertedMaxAmount < 0n) {
        this.common.showMessage("error", "请输入有效的最大兑换数量");
        this.maxExchangeAmountInput.classList.add("is-danger");
        setTimeout(
          () => this.maxExchangeAmountInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      if (
        isNaN(transferTypeInt) ||
        transferTypeInt < 0 ||
        transferTypeInt > 1
      ) {
        this.common.showMessage("error", "请选择有效的代币类型");
        this.transferTypeSelect.classList.add("is-danger");
        setTimeout(
          () => this.transferTypeSelect.classList.remove("is-danger"),
          3000
        );
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
        this.durationWeeksInput.classList.add("is-danger");
        setTimeout(
          () => this.durationWeeksInput.classList.remove("is-danger"),
          3000
        );
        return;
      }

      // Check for overflow
      const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);
      if (convertedMaxAmount > maxUint256) {
        throw new Error(
          `计算结果过大，超出合约支持的范围。请减小最大兑换数量。`
        );
      }
      let fairStakeContract=this.admin.contractInteraction.contract;

      // 使用common.js的send方法调用合约
      const result = await this.common.send(
        fairStakeContract,
        "setTokenExchangeRate",
        "正在设置代币汇率...",
        {},
        tokenAddressStr,
        tokenRate.toString(),
        frRate.toString(),
        convertedMaxAmount.toString(),
        transferTypeInt,
        durationWeeksInt
      );

      this.common.showMessage("success", `交易成功: ${result.txId}`);
      
      // 更新代币兑换信息
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

// 导出exchangeAdmin对象供外部调用
const exchangeAdmin = new ExchangeAdmin();
export { exchangeAdmin };

// 提供全局访问方式，以确保兼容性
window.exchangeAdmin = exchangeAdmin;
