/**
 * 销毁奖励功能模块
 * 从 index.html 和 app.js 中抽取，实现 FR 代币销毁兑换奖励功能
 */

class BurnRewardModule {
  constructor() {
    // 获取 tronWebConnector
    this.tronWebConnector = window.tronWebConnector;
    
    // 获取合约交互模块
    this.contractInteraction = window.contractInteraction;
    
    // 获取公共工具模块
    this.common = window.fairStakeCommon;
    
    // 获取国际化模块
    this.i18n = null;
    
    // 初始化 UI 元素引用
    this.exchangeFrAmount = null;
    this.tokenDropdown = null;
    this.selectedTokenText = null;
    this.selectedTokenAddress = null;
    this.exchangeButton = null;
    this.tokenExchangeInfo = null;
    this.timeLimitNotice = null;
    
    // 存储兑换信息
    this.exchangeTokenInfo = null;
    
    // 初始化奖励代币选项
    this.rewardTokenOptions = [];
  }

  /**
   * 初始化销毁奖励功能模块
   */
  async init() {
    console.log('初始化销毁奖励功能模块...');

    try {
      // 初始化多语言支持
      try {
        await this.i18n();
      } catch(ex) {
        console.log(ex);
      }

      // 确保 DOM 完全加载
      if (document.readyState !== 'complete') {
        console.log('等待 DOM 加载完成...');
        await new Promise((resolve) => {
          window.addEventListener('load', resolve);
        });
        console.log('DOM 加载完成');
      }
      this.initUIReferences();

     // 设置下拉菜单交互
      this.setupDropdownInteraction();

      // 加载奖励代币选项
      this.loadRewardTokenOptions();

      // 设置代币交换按钮事件监听器
      this.setupExchangeButtonListener();

      // 设置FR数量输入框事件监听器
      this.setupFrAmountInputListener();

      console.log('销毁奖励功能模块初始化完成');
      return true;
    } catch (error) {
      console.error('销毁奖励功能模块初始化错误:', error);
      return false;
    }
  }
  /**
   * 初始化 UI 元素
   */
  initUIReferences() {
    // 获取代币下拉菜单相关元素
    this.tokenDropdown = document.getElementById("tokenDropdown");
    this.tokenDropdownTrigger = this.tokenDropdown
      ? this.tokenDropdown.querySelector(".dropdown-trigger button")
      : null;
    this.tokenDropdownMenu = document.getElementById("tokenDropdownMenu");
    this.tokenDropdownContent = document.getElementById("tokenDropdownContent");
    this.selectedTokenText = document.getElementById("selectedTokenText");
    this.selectedTokenAddress = document.getElementById("selectedTokenAddress");

    if (this.exchangeFrAmount) {
      console.log("找到交换金额输入框");
    } else {
      console.log("未找到交换金额输入框");
    }

    if (this.tokenDropdown) {
      console.log("找到代币下拉菜单");
    } else {
      console.log("未找到代币下拉菜单");
    }
  }

  /**
   * 加载奖励代币选项
   */
  loadRewardTokenOptions() {
    try {
      if (
        !this.tokenDropdownContent ||
        !window.CONFIG ||
        !window.CONFIG.networks ||
        !window.CONFIG.currentNetwork
      ) {
        return;
      }

      const currentNetworkConfig =
        window.CONFIG.networks[window.CONFIG.currentNetwork];
      if (
        !currentNetworkConfig ||
        !currentNetworkConfig.burnRewards ||
        !Array.isArray(currentNetworkConfig.burnRewards)
      ) {
        // 如果当前网络没有配置burnRewards，则显示默认选项
        this.tokenDropdownContent.innerHTML =
          '<a href="#" class="dropdown-item is-disabled">当前网络无可用奖励代币</a>';
        this.selectedTokenText.textContent = "当前网络无可用奖励代币";
        this.selectedTokenAddress.value = "";
        return;
      }

      // 清空下拉菜单内容
      this.tokenDropdownContent.innerHTML = "";

      // 添加每个奖励代币选项
      currentNetworkConfig.burnRewards.forEach((token) => {
        if (token && token.address && token.symbol) {
          const dropdownItem = document.createElement("a");
          dropdownItem.href = "#";
          dropdownItem.className = "dropdown-item";
          dropdownItem.dataset.address = token.address;
          dropdownItem.dataset.symbol = token.symbol;

          // 创建选项内容，包含图标和文本
          const itemContent = document.createElement("div");
          itemContent.style.display = "flex";
          itemContent.style.alignItems = "center";

          // 添加代币图标
          const tokenIcon = document.createElement("img");
          tokenIcon.src = token.icon || "https://via.placeholder.com/20"; // 默认图标
          tokenIcon.alt = token.symbol;
          tokenIcon.style.width = "20px";
          tokenIcon.style.height = "20px";
          tokenIcon.style.marginRight = "10px";
          tokenIcon.style.borderRadius = "50%";

          // 添加代币信息
          const tokenInfo = document.createElement("span");
          tokenInfo.textContent = `${token.symbol} (${token.address})`;

          // 组装选项
          itemContent.appendChild(tokenIcon);
          itemContent.appendChild(tokenInfo);
          dropdownItem.appendChild(itemContent);

          // 添加点击事件
          dropdownItem.addEventListener("click", (e) => {
            e.preventDefault();
            this.selectToken(token.address, token.symbol, token.icon);
          });

          this.tokenDropdownContent.appendChild(dropdownItem);
        }
      });
    } catch (error) {
      console.error("加载奖励代币选项出错:", error);
    }
  }

  /**
   * 选择代币
   * @param {string} address - 代币地址
   * @param {string} symbol - 代币符号
   * @param {string} icon - 代币图标URL
   */
  async selectToken(address, symbol, icon) {
    // 更新选中状态
    this.selectedTokenAddress.value = address;
    this.selectedTokenText.textContent = symbol;
    this.selectedTokenSymbol = symbol; // 保存选中的代币符号

    // 隐藏下拉菜单
    if (this.tokenDropdown) {
      this.tokenDropdown.classList.remove("is-active");
    }

    // 如果有图标，在选择按钮中显示
    const buttonContent = this.tokenDropdownTrigger
      ? this.tokenDropdownTrigger.querySelector("span:first-child")
      : null;
    if (buttonContent) {
      // 设置flex布局和垂直居中
      buttonContent.style.display = "flex";
      buttonContent.style.alignItems = "center";
      buttonContent.style.justifyContent = "center";
      buttonContent.style.height = "100%";

      // 清空当前内容
      while (buttonContent.firstChild) {
        buttonContent.removeChild(buttonContent.firstChild);
      }

      // 添加图标和文本
      if (icon) {
        const tokenIcon = document.createElement("img");
        tokenIcon.src = icon;
        tokenIcon.alt = symbol;
        tokenIcon.style.width = "20px";
        tokenIcon.style.height = "20px";
        tokenIcon.style.marginRight = "10px";
        tokenIcon.style.borderRadius = "50%";
        tokenIcon.style.verticalAlign = "middle";
        buttonContent.appendChild(tokenIcon);
      }

      const symbolTextSpan = document.createElement("span");
      symbolTextSpan.textContent = symbol;
      symbolTextSpan.style.verticalAlign = "middle";
      symbolTextSpan.style.display = "inline-block";
      buttonContent.appendChild(symbolTextSpan);
    }
    const exchangeResult = await this.contractInteraction.getTokenExchangeInfo(
      address
    );
    if (exchangeResult.success) {
      this.exchangeTokenInfo = exchangeResult.data;
    } else {
      this.exchangeTokenInfo = null;
    }
    // 获取并显示代币兑换信息
    await this.fetchAndDisplayTokenExchangeInfo(address, symbol);

    // 检查并更新兑换按钮状态（基于时间限制）
    this.checkAndUpdateExchangeButtonStatus();

    // 初始禁用按钮，直到用户输入有效金额
    if (this.exchangeButton) {
      this.exchangeButton.disabled = true;
    }

    // 如果FR输入框有值，重新计算兑换数量
    const frAmountInput = document.getElementById("exchangeFrAmount");
    if (
      frAmountInput &&
      frAmountInput.value.trim() &&
      !isNaN(frAmountInput.value.trim()) &&
      parseFloat(frAmountInput.value.trim()) > 0
    ) {
      // 触发input事件以重新计算
      frAmountInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  /**
   * 获取并显示代币兑换信息
   * @param {string} tokenAddress - 代币地址
   * @param {string} tokenSymbol - 代币符号
   */
  async fetchAndDisplayTokenExchangeInfo(tokenAddress, tokenSymbol) {
    try {
      // 确保合约交互模块已初始化
      if (!this.contractInteraction) {
        console.warn("合约交互模块未初始化");
        return;
      }

      // 显示加载状态
      const exchangeInfoElement =
        document.getElementById("tokenExchangeInfo") ||
        document.createElement("div");
      exchangeInfoElement.id = "tokenExchangeInfo";
      exchangeInfoElement.textContent = "正在获取兑换信息...";

      // 将元素添加到DOM中（如果还没有）
      const tokenDropdownContainer =
        document.getElementById("tokenDropdown")?.parentElement;
      if (tokenDropdownContainer && !exchangeInfoElement.parentElement) {
        tokenDropdownContainer.appendChild(exchangeInfoElement);
      }

      // 调用合约获取兑换信息
      const result = await this.contractInteraction.getTokenExchangeInfo(
        tokenAddress
      );
      const data = this.exchangeTokenInfo;
      if (data) {
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
            parseFloat(data.rateNumerator) / parseFloat(data.rateDenominator);

          // 考虑小数位数差异进行调整
          // 如果FR代币小数位数为18，目标代币小数位数为6，那么1 FR = baseRate * (10^6 / 10^18) 目标代币
          // 反之亦然
          const decimalsAdjustment = Math.pow(10, frDecimals - tokenDecimals);
          exchangeRate = baseRate * decimalsAdjustment;
        }
        exchangeRate = exchangeRate.toFixed(4);

        // 计算人类可读的剩余兑换量，除以目标代币的精度系数
        const humanReadableRemainingAmount =
          parseFloat(data.remainingExchangeAmount) /
          Math.pow(10, tokenDecimals);

        // 更新显示内容
        exchangeInfoElement.innerHTML = `
          <div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
            <h4 style="margin-top: 0; color: #333;">${tokenSymbol} 兑换信息</h4>
            <p><strong>兑换率:</strong> 1 FR = ${exchangeRate} ${tokenSymbol}</p>
            <p><strong>开启时间:</strong> ${formatTimestamp(data.startTime)}</p>
            <p><strong>结束时间:</strong> ${formatTimestamp(data.endTime)}</p>
            <p><strong>剩余兑换量:</strong> ${humanReadableRemainingAmount.toFixed(
              6
            )} ${tokenSymbol}</p>
          </div>
        `;
        return {
          exchangeRate,
          humanReadableRemainingAmount,
          startTime: formatTimestamp(data.startTime),
          endTime: formatTimestamp(data.endTime),
        };
      } else {
        exchangeInfoElement.innerHTML = `<p style="color: #ff3860; margin-top: 10px;"> ${
          result.error || "未知错误"
        }</p>`;
      }
    } catch (error) {
      console.error("获取代币兑换信息时出错:", error);
      const exchangeInfoElement =
        document.getElementById("tokenExchangeInfo") ||
        document.createElement("div");
      exchangeInfoElement.id = "tokenExchangeInfo";
      exchangeInfoElement.innerHTML = `<p style="color: #ff3860; margin-top: 10px;">获取兑换信息时发生错误: ${error.message}</p>`;
    }
  }

  /**
   * 设置下拉菜单交互
   */
  setupDropdownInteraction() {
    if (!this.tokenDropdown || !this.tokenDropdownTrigger) return;

    // 点击下拉触发器切换菜单显示状态
    this.tokenDropdownTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      this.tokenDropdown.classList.toggle("is-active");
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener("click", (e) => {
      if (this.tokenDropdown && !this.tokenDropdown.contains(e.target)) {
        this.tokenDropdown.classList.remove("is-active");
      }
    });

    // 阻止下拉菜单内的点击事件冒泡
    if (this.tokenDropdownMenu) {
      this.tokenDropdownMenu.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * 设置FR数量输入框事件监听器
   */
  setupFrAmountInputListener() {
    this.exchangeFrAmount = document.getElementById("exchangeFrAmount");
    if (!this.exchangeFrAmount) return;

    // 监听输入变化
    this.exchangeFrAmount.addEventListener("input", async () => {
      const frAmount = this.exchangeFrAmount.value.trim();

      // 确保有有效的输入和选中的代币
      if (frAmount && !isNaN(frAmount) && this.exchangeTokenInfo) {
        let frAmountNum = parseFloat(frAmount);
        if (frAmountNum > 0) {
          let exchangeAmount =
            (((frAmountNum * Math.pow(10, this.exchangeTokenInfo.frDecimals)) /
              Math.pow(10, this.exchangeTokenInfo.tokenDecimals)) *
              this.exchangeTokenInfo.rateNumerator) /
            this.exchangeTokenInfo.rateDenominator;
          // 显示结果
          const outputInfoElement =
            document.getElementById("exchangeOutputInfo") ||
            document.createElement("div");
          outputInfoElement.id = "exchangeOutputInfo";
          outputInfoElement.className = "mt-2";

          // 检查是否大于等于可兑换数量（转换为相同精度）
          const humanReadableRemainingAmount =
            parseFloat(this.exchangeTokenInfo.remainingExchangeAmount) /
            Math.pow(10, this.exchangeTokenInfo.tokenDecimals);
          const isAmountValid =
            exchangeAmount > 0 &&
            exchangeAmount <= humanReadableRemainingAmount;

          // 根据数量有效性更新按钮状态
          if (this.exchangeButton) {
            // 只有在时间范围内且数量有效时才启用按钮
            this.exchangeButton.disabled = !isAmountValid;

            if (!isAmountValid) {
              this.exchangeButton.title =
                exchangeAmount <= 0
                  ? "请输入有效的兑换数量"
                  : "兑换数量超过剩余可兑换量";
            } else {
              this.exchangeButton.title = "";
            }
          }

          // 根据数量有效性设置输出信息样式
          const bgColor = isAmountValid ? "#f0f8ff" : "#ffe0e0";
          const messageColor = isAmountValid ? "#333" : "#d00";
          const validationMessage = isAmountValid
            ? ""
            : exchangeAmount <= 0
            ? '<p style="color: #d00;">请输入有效的兑换数量</p>'
            : `<p style="color: #d00;">兑换数量超过剩余可兑换量 ${humanReadableRemainingAmount.toFixed(
                6
              )} ${this.selectedTokenSymbol}</p>`;

          outputInfoElement.innerHTML = `
                <div style="padding: 8px; background: ${bgColor}; border-radius: 4px;">
                <p style="color: ${messageColor};"><strong>可兑换数量:</strong> ${exchangeAmount.toFixed(
            6
          )} ${this.selectedTokenSymbol}</p>
                ${validationMessage}
                </div>
            `;

          // 添加到DOM
          const inputContainer = this.exchangeFrAmount.parentNode;
          if (inputContainer && !outputInfoElement.parentNode) {
            inputContainer.appendChild(outputInfoElement);
          }
        } else {
          // 无效数量，禁用按钮
          if (this.exchangeButton) {
            this.exchangeButton.disabled = true;
            this.exchangeButton.title = "请输入有效的兑换数量";
          }

          // 清除显示
          const outputInfoElement =
            document.getElementById("exchangeOutputInfo");
          if (outputInfoElement) {
            outputInfoElement.innerHTML =
              '<div style="padding: 8px; background: #ffe0e0; border-radius: 4px;"><p style="color: #d00;"><strong>请输入有效的兑换数量</strong></p></div>';
          }
        }
      } else {
        // 清除显示
        const outputInfoElement = document.getElementById("exchangeOutputInfo");
        if (outputInfoElement) {
          outputInfoElement.innerHTML = "";
        }

        // 禁用按钮
        if (this.exchangeButton) {
          this.exchangeButton.disabled = true;
        }
      }
    });
  }

  /**
   * 检查并更新兑换按钮状态基于时间限制
   */
  checkAndUpdateExchangeButtonStatus() {
    if (!this.exchangeButton || !this.exchangeTokenInfo) {
      return;
    }

    const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    const startTime = parseInt(this.exchangeTokenInfo.startTime);
    const endTime = parseInt(this.exchangeTokenInfo.endTime);

    // 检查是否在有效时间范围内
    if (now >= startTime && now <= endTime) {
      // 在时间范围内，启用按钮
      this.exchangeButton.disabled = false;
      this.exchangeButton.title = "";

      // 移除任何可能添加的时间限制提示
      const timeLimitElement = document.getElementById(
        "exchangeTimeLimitNotice"
      );
      if (timeLimitElement && timeLimitElement.parentNode) {
        timeLimitElement.parentNode.removeChild(timeLimitElement);
      }
    } else {
      // 不在时间范围内，禁用按钮
      this.exchangeButton.disabled = true;

      // 创建并显示时间限制提示
      let timeLimitNotice = document.getElementById("exchangeTimeLimitNotice");
      if (!timeLimitNotice) {
        timeLimitNotice = document.createElement("div");
        timeLimitNotice.id = "exchangeTimeLimitNotice";
        timeLimitNotice.className = "notification is-warning mt-2";

        // 将提示添加到按钮上方或附近
        if (this.exchangeButton.parentNode) {
          this.exchangeButton.parentNode.insertBefore(
            timeLimitNotice,
            this.exchangeButton
          );
        }
      }

      // 格式化日期时间
      const formatTimestamp = (timestamp) => {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString();
      };

      if (now < startTime) {
        this.exchangeButton.title = `兑换未开始，请等待到 ${formatTimestamp(
          startTime
        )}`;
        timeLimitNotice.textContent = `兑换未开始，请等待到 ${formatTimestamp(
          startTime
        )}`;
      } else {
        this.exchangeButton.title = `兑换已结束，结束时间为 ${formatTimestamp(
          endTime
        )}`;
        timeLimitNotice.textContent = `兑换已结束，结束时间为 ${formatTimestamp(
          endTime
        )}`;
      }
    }
  }

  /**
   * 设置代币交换按钮事件监听器
   */
  setupExchangeButtonListener() {
    if (!this.exchangeButton) {
      this.exchangeButton = document.getElementById("exchangeButton");
      if (!this.exchangeButton) return;
    }

    // 初始检查按钮状态
    this.checkAndUpdateExchangeButtonStatus();

    // 设置定时器，每30秒检查一次时间限制状态
    if (!this.exchangeTimeChecker) {
      this.exchangeTimeChecker = setInterval(() => {
        if (this.exchangeTokenInfo) {
          this.checkAndUpdateExchangeButtonStatus();
        }
      }, 30000); // 30秒检查一次
    }

    this.exchangeButton.addEventListener("click", async () => {
      try {
        // 再次检查时间限制（防止定时器延迟导致的状态不准确）
        this.checkAndUpdateExchangeButtonStatus();

        // 如果按钮被禁用，直接返回
        if (this.exchangeButton.disabled) {
          return;
        }

        // 获取选中的奖励代币地址
        const selectedTokenAddress = this.selectedTokenAddress?.value;
        if (!selectedTokenAddress) {
          this.common.showMessage("warning", "请选择奖励代币");
          return;
        }

        // 获取交换数量
        const exchangeAmount = this.exchangeFrAmount?.value.trim();
        if (
          !exchangeAmount ||
          isNaN(exchangeAmount) ||
          parseFloat(exchangeAmount) <= 0
        ) {
          this.common.showMessage("warning", "请输入有效的交换数量");
          return;
        }

        this.common.showMessage("info", `正在销毁FR并兑换奖励代币...`);

        // 调用合约进行交换
        const result = await this.contractInteraction.exchangeFRForToken(
          selectedTokenAddress,
          exchangeAmount
        );

        if (result.state === "ok") {
          this.common.showMessage("success", "代币交换成功!");
          // 重新加载所有数据
          this.loadAndUpdateAllData();
        } else {
          this.common.showMessage("error", "代币交换失败: " + result.msg);
        }
      } catch (error) {
        console.error("代币交换操作出错:", error);
        this.common.showMessage("error", "代币交换出错: " + error.message);
      }
    });
  }
}


export default BurnRewardModule;