class Common {
  constructor() {
    this.config = null;
    this.network = null;
    this.tronWebConnector = null;
    this.diamondAddress = null;
    this.diamondABI = null;
    this.funTronWeb = null;
    this.TronWeb = window.TronWeb;
    this.diamondContract = null;
  }

  /**
   * 检测合约是否存在（通过bytecode）
   * @param {string} contractAddress 合约Base58地址
   * @returns {boolean} 合约是否存在
   */
  async isContractExistByCode(contractAddress) {
    try {
      let tronWeb = this.tronWebConnector.getTronWeb();
      const account = await tronWeb.trx.getAccount(contractAddress);
      return account !== null && account.type === "Contract";
    } catch (error) {
      console.error("检测合约字节码失败：", error.message);
      return false;
    }
  }
  #diamondContract = null;

  async getDiamondContract() {
    if (this.#diamondContract == null) {
      const tronWeb = this.tronWebConnector.getTronWeb();
      this.#diamondContract = await tronWeb.contract(
        this.diamondABI,
        this.network.diamondAddress
      );
    }
    return this.#diamondContract;
  }

  async init() {
    this.config = await this.#loadConfig();
    // 设置全局CONFIG变量，以便其他文件访问
    window.CONFIG = this.config;
    window.fairStakeCommon = this;

    // 创建单例实例
    const tronWebConnector = new TronWebConnector();
    this.tronWebConnector = tronWebConnector;
    window.tronWebConnector = tronWebConnector;
    tronWebConnector.init();
    this.funTronWeb = new window.TronWeb.TronWeb({
      fullHost: "https://nile.trongrid.io",
    });

    // 关闭加载消息
    document
      .querySelector("#loadingOverlay .delete")
      ?.addEventListener("click", () => {
        document.getElementById("loadingOverlay").classList.add("is-hidden");
      });
  }

  async changeNetwork() {
    //检测合约是否存在
    try {
      const isContractExist = await this.isContractExistByCode(
        this.config.networks["nile"].stakedToken.address
      );
      if (isContractExist) {
        // mainnet
        this.network = this.config.networks["nile"];
        this.network.name = "NILE";
      } else {
        //nilenet
        const exists = await this.isContractExistByCode(
          this.config.networks["shasta"].stakedToken.address
        );
        if (exists) {
          this.network = this.config.networks["shasta"];
          this.network.name = "SHASTA";
        } else {
          this.network = this.config.networks["mainnet"];
          this.network.name = "MAINNET";
        }
      }
      if (this.network.burnRewards) {
        this.network.burnRewards.forEach( async (m) => {
          if (m.address.length < 10) {            
            const addr = parseInt(m.address);
            let strAddr = addr.toString(16).padStart(40, "0");
            m.address = this.TronWeb.utils.address.fromHex(`41${strAddr}`);
          }
        });
      }
      this.#diamondContract = null;
      this.diamondAddress = this.network.diamondAddress;
    } catch (e) {
      console.error("切换网络失败:", e.message);
    }
  }

  /**
   * 简化钱包地址显示
   * @param {string} address - 完整的钱包地址
   * @param {number} startLength - 显示开头的字符数，默认6
   * @param {number} endLength - 显示结尾的字符数，默认4
   * @returns {string} 简化后的钱包地址，如：TXYZ...abcd
   */
  truncateAddress(address, startLength = 6, endLength = 6) {
    if (!address || typeof address !== "string") {
      return "";
    }

    // 检查地址长度是否足够显示
    if (address.length <= startLength + endLength) {
      return address;
    }

    // 截取开头和结尾部分，中间用省略号连接
    const start = address.substring(0, startLength);
    const end = address.substring(address.length - endLength);
    return `${start}...${end}`;
  }

  /**
   * 格式化交易哈希
   * @param {string} txHash - 完整的交易哈希
   * @param {number} startLength - 显示开头的字符数，默认6
   * @param {number} endLength - 显示结尾的字符数，默认4
   * @returns {string} 格式化后的交易哈希，如：TXYZ...abcd
   */
  formatTxHash(txHash, startLength = 6, endLength = 4) {
    return this.truncateAddress(txHash, startLength, endLength);
  }

  formatHexAddressToBase58(address) {
    if (address == null || address == undefined || address == "") {
      return "";
    }
    if (address <= 1) {
      return "Black Hole";
    } else {
      return this.truncateAddress(this.funTronWeb.address.fromHex(address));
    }
  }

  parseRevertData(txInfo, contract, method) {
    let reverData = txInfo.contractResult[0];
    if (txInfo.receipt && txInfo.receipt.result == "SUCCESS") {
      //找到交易方法的abi
      const methodABIs = contract.abi.filter((item) => item.name === method);
      if (methodABIs.length === 0) {
        throw `未找到方法 ${method} 的ABI`;
      }
      try {
        let decodedParams;
        try {
          // 降级尝试 decodeParamsV2ByABI
          decodedParams = tronWeb.utils.abi.decodeParamsV2ByABI(
            methodABIs[0],
            "0x" + txInfo.contractResult[0]
          );
        } catch (e2) {
          console.error("解码出错", e2);
          decodedParams = {};
        }
        return decodedParams;
      } catch (e) {
        console.log(e);
        return "";
      }
    }
    // 移除前缀 0x（如果有）
    const hexData = reverData.startsWith("0x") ? reverData.slice(2) : reverData;
    let errMsg = tronWeb.toUtf8(txInfo.resMessage);
    errMsg += "详情: ";
    // 场景1：Reason String（前 4 字节是 0x08c379a0）
    const reasonStringSelector = "08c379a0";
    if (hexData.startsWith(reasonStringSelector)) {
      try {
        // 截取字符串部分：跳过前 4 字节（选择器）+ 32 字节（字符串长度）
        const stringHex = hexData.slice(4 + 64); // 4字节=8字符，32字节=64字符
        const reason = Buffer.from(stringHex, "hex").toString("utf8").trim();
        errMsg += `Reason String: ${reason}`;
      } catch (e) {
        errMsg += `解析 reason string 失败：${e.message}`;
      }
    }

    // 场景2：Custom Error（通过 ABI 解码）
    try {
      // 提取 custom error 的选择器（前 4 字节）
      const errorSelector = hexData.slice(0, 8); // 4字节=8字符
      // 从 ABI 中找到匹配选择器的 custom error
      const customError = contract.abi.find(
        (item) => item.type === "error" && item.Hash === errorSelector
        //tronWeb.utils.crypto.sha3(item.name + '(' + item.inputs.map(i => i.type).join(',') + ')').slice(2, 10) === errorSelector
      );

      if (!customError) {
        errMsg += `未知 Custom Error（选择器：0x${errorSelector}），请检查 ABI 是否包含该错误`;
      }

      // 解码 custom error 的参数（跳过选择器，截取后续数据）
      const paramsHex = hexData.slice(8);
      const decodedParams = tronWeb.utils.abi.decodeParamsV2ByABI(
        customError.inputs,
        paramsHex
      );

      // 格式化输出：错误名 + 参数
      const paramsStr = Object.entries(decodedParams)
        .filter(([key]) => !isNaN(Number(key))) // 过滤索引键（如 0、1）
        .map(
          ([key, value]) =>
            `${customError.inputs[key].name || "param" + key}: ${value}`
        )
        .join(", ");

      errMsg += `Custom Error: ${customError.name}(${paramsStr})`;
    } catch (e) {
      errMsg += `解析 custom error 失败：${e.message}（原始数据：0x${hexData}）`;
    }
    throw new Error(errMsg);
  }

  async call(contract, methodName, params = []) {
    try {
      const tronWeb = this.tronWebConnector.getTronWeb();

      // 从ABI中找到对应的方法
      const methodAbi = contract.abi.find((item) => {
        return item.type === "function" && item.name === methodName;
      });

      if (!methodAbi) {
        throw new Error(`Method ${methodName} not found in contract ABI`);
      }

      // 构建函数签名
      const inputTypes = methodAbi.inputs.map((input) => input.type);
      const functionSignature = `${methodName}(${inputTypes.join(",")})`;

      // 编码函数选择器 (前4字节的SHA3哈希)
      // 兼容不同TronWeb版本的SHA3实现
      let sha3Result;
      if (tronWeb.utils.crypto && tronWeb.utils.crypto.sha3) {
        sha3Result = tronWeb.utils.crypto.sha3(functionSignature);
      } else if (tronWeb.utils.sha3) {
        sha3Result = tronWeb.utils.sha3(functionSignature);
      } else {
        // Fallback to a simple implementation if SHA3 is not available (only as last resort)
        console.warn(
          "TronWeb SHA3 method not found, using fallback implementation"
        );
        sha3Result = "0x" + Array(66).join("0").slice(0, 64); // 返回全零哈希作为最后选择
      }
      const functionSelector = sha3Result.slice(0, 10); // 0x + 8 characters

      // 编码参数
      let parameterHex = "";
      if (params.length > 0) {
        const encodedParams = await tronWeb.utils.abi.encodeParams(
          inputTypes,
          params
        );
        parameterHex = encodedParams.replace("0x", "");
      }

      // 构建完整的data字段
      const dataHex = functionSelector + parameterHex;

      // 使用TronWeb的transactionBuilder.triggerConstantContract方法
      const result = await tronWeb.transactionBuilder.triggerConstantContract(
        "0x" + tronWeb.address.toHex(contract.address),
        dataHex,
        {}, // 不需要options
        100000000 // fee limit
      );

      if (!result || !result.result) {
        throw new Error("Contract call failed: No result returned");
      }

      if (result.result.code !== "SUCCESS") {
        throw new Error(`Contract call failed: ${result.result.message}`);
      }

      // 解码返回结果
      const returnValue = result.constant_result[0];
      if (!returnValue) {
        return null; // 无返回值的方法
      }

      // 根据方法的输出类型解码结果
      if (methodAbi.outputs.length === 1) {
        const outputType = methodAbi.outputs[0].type;
        return this.#decodeReturnData(returnValue, outputType, tronWeb);
      } else if (methodAbi.outputs.length > 1) {
        // 多个返回值，解码为对象
        const outputTypes = methodAbi.outputs.map((output) => output.type);
        const decoded = await tronWeb.utils.abi.decodeParams(
          outputTypes,
          returnValue
        );

        // 将索引键转换为命名键
        const namedResult = {};
        methodAbi.outputs.forEach((output, index) => {
          namedResult[output.name || `param${index}`] = decoded[index];
        });

        return namedResult;
      }

      return returnValue;
    } catch (error) {
      console.error(`Ultra-low-level contract call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 解码合约返回数据
   * @param {string} dataHex - 十六进制的返回数据
   * @param {string} dataType - 返回数据类型
   * @param {Object} tronWeb - TronWeb实例
   * @returns {any} 解码后的数据
   */
  #decodeReturnData(dataHex, dataType, tronWeb) {
    try {
      // 简单类型的直接解码
      switch (dataType) {
        case "bool":
          return tronWeb.utils.abi.decodeParams(["bool"], dataHex)[0];
        case "uint256":
        case "uint":
        case "int256":
        case "int":
          return tronWeb.utils.abi.decodeParams([dataType], dataHex)[0];
        case "address":
          const hexAddress = tronWeb.utils.abi.decodeParams(
            ["address"],
            dataHex
          )[0];
          return tronWeb.address.fromHex(hexAddress); // 转换为Base58格式
        case "string":
          return tronWeb.utils.abi.decodeParams(["string"], dataHex)[0];
        default:
          // 复杂类型或数组
          return tronWeb.utils.abi.decodeParams([dataType], dataHex)[0];
      }
    } catch (error) {
      console.error(`Failed to decode return data: ${error.message}`);
      return dataHex; // 解码失败时返回原始数据
    }
  }

  /**
   * 延迟指定毫秒
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} 延迟结束的 Promise
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Format number to 6 decimal places with thousands separator, handle scientific notation
   * @param {number|string} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (num === null || num === undefined) {
      num = 0;
    }
    if (typeof num === "string") {
      const index = num.indexOf("e");
      if (index === -1) {
        num = parseFloat(num);
      } else {
        const exponent = num.substring(index);
        let str = num.substring(0, index);
        if (str.length > 8) {
          str = str.substring(0, 8);
        }
        return str + exponent;
      }
    }
    if (typeof num !== "number" || isNaN(num)) {
      num = 0;
    }
    // Convert to fixed decimal places first to avoid scientific notation
    if (Number.isInteger(num)) {
      // Format integer with thousands separator
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    const fixedNum = num.toFixed(6);
    // Split into integer and decimal parts
    const parts = fixedNum.toString().split(".");
    // Format integer part with thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Join back together
    return parts.join(".");
  }

  /**
   * 显示消息通知
   * @param {string} type - 消息类型：success, error, warning, info
   * @param {string} message - 消息内容或翻译键
   * @param {Object} options - 翻译选项
   */
  showMessage(type, message, options = {}) {
    // 尝试翻译消息
    let translatedMessage = message;
    if (window.i18n && window.i18n.t && typeof message === "string") {
      try {
        translatedMessage = window.i18n.t(message, options);
      } catch (e) {
        // 如果翻译失败，使用原始消息
        console.warn("消息翻译失败，使用原始文本:", message);
      }
    }

    console.log(`${type}: ${translatedMessage}`);

    // 检查是否存在消息区域
    let messageElement = document.getElementById("appMessage");
    if (!messageElement) {
      // 创建消息元素
      messageElement = document.createElement("div");
      messageElement.id = "appMessage";
      document.body.appendChild(messageElement);
    }

    // 重置类名，只使用我们在CSS中定义的类
    messageElement.className = "app-message";
    let showTime = 6000;

    // 根据消息类型添加相应的类
    switch (type) {
      case "success":
        messageElement.classList.add("success");
        break;
      case "error":
        messageElement.classList.add("error");
        showTime = 14000;
        break;
      case "warning":
        messageElement.classList.add("warning");
        showTime = 10000;
        break;
      default:
        messageElement.classList.add("info");
    }

    // 设置消息内容
    messageElement.textContent = translatedMessage;

    // 确保消息显示
    messageElement.style.display = "block";

    // 自动隐藏消息
    setTimeout(() => {
      messageElement.style.display = "none";
    }, showTime);
  }

  /**
   * 显示确认对话框
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框消息内容
   * @returns {Promise<boolean>} 用户确认返回true，取消返回false
   */
  showConfirmDialog(title, message) {
    return new Promise((resolve) => {
      // 检查是否已存在确认对话框
      let dialogElement = document.getElementById("confirmDialog");
      if (!dialogElement) {
        // 创建对话框容器
        dialogElement = document.createElement("div");
        dialogElement.id = "confirmDialog";
        dialogElement.className = "confirm-dialog-overlay";
        dialogElement.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        `;

        // 创建对话框内容
        const dialogContent = document.createElement("div");
        dialogContent.className = "confirm-dialog";
        dialogContent.style.cssText = `
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        // 创建标题
        const dialogTitle = document.createElement("h3");
        dialogTitle.id = "confirmDialogTitle";
        dialogTitle.style.cssText = `
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        `;

        // 创建消息
        const dialogMessage = document.createElement("p");
        dialogMessage.id = "confirmDialogMessage";
        dialogMessage.style.cssText = `
          margin-bottom: 20px;
          color: #555;
          line-height: 1.5;
        `;

        // 创建按钮容器
        const dialogButtons = document.createElement("div");
        dialogButtons.className = "confirm-dialog-buttons";
        dialogButtons.style.cssText = `
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        `;

        // 创建取消按钮
        const cancelButton = document.createElement("button");
        cancelButton.id = "confirmDialogCancel";
        cancelButton.textContent = "取消";
        cancelButton.style.cssText = `
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          color: #333;
          cursor: pointer;
          font-size: 14px;
        `;

        // 创建确认按钮
        const confirmButton = document.createElement("button");
        confirmButton.id = "confirmDialogConfirm";
        confirmButton.textContent = "确认";
        confirmButton.style.cssText = `
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
          font-size: 14px;
        `;

        // 组装对话框
        dialogButtons.appendChild(cancelButton);
        dialogButtons.appendChild(confirmButton);
        dialogContent.appendChild(dialogTitle);
        dialogContent.appendChild(dialogMessage);
        dialogContent.appendChild(dialogButtons);
        dialogElement.appendChild(dialogContent);
        document.body.appendChild(dialogElement);

        // 添加点击外部区域关闭对话框的功能 - 使用事件委托避免重复绑定
        dialogElement.addEventListener("click", (e) => {
          if (e.target === dialogElement) {
            dialogElement.style.display = "none";
            // 这里不直接resolve，而是通过按钮事件处理
          }
        });
      }

      // 移除之前的事件监听器
      const cancelButton = document.getElementById("confirmDialogCancel");
      const confirmButton = document.getElementById("confirmDialogConfirm");

      // 克隆按钮来移除所有事件监听器
      const newCancelButton = cancelButton.cloneNode(true);
      const newConfirmButton = confirmButton.cloneNode(true);

      // 替换按钮
      cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
      confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

      // 添加新的按钮点击事件
      newCancelButton.addEventListener("click", () => {
        dialogElement.style.display = "none";
        resolve(false);
      });

      newConfirmButton.addEventListener("click", () => {
        dialogElement.style.display = "none";
        resolve(true);
      });

      // 添加ESC键关闭对话框的功能
      const handleEscKey = (e) => {
        if (e.key === "Escape") {
          dialogElement.style.display = "none";
          resolve(false);
          document.removeEventListener("keydown", handleEscKey);
        }
      };
      // 先移除可能存在的旧事件监听器
      document.removeEventListener("keydown", handleEscKey);
      document.addEventListener("keydown", handleEscKey);

      // 设置对话框内容
      document.getElementById("confirmDialogTitle").textContent = title;
      document.getElementById("confirmDialogMessage").textContent = message;

      // 显示对话框
      dialogElement.style.display = "flex";
    });
  }

  async send(contract, method, loadingMsg, data, ...args) {
    let result = {};
    try {
      this.showLoading(loadingMsg);
      let fn = contract[method];
      if (!data) {
        data = {};
      }
      const txId = await fn(...args).send(data);
      const txInfo = await this.getConfirmedTxInfo(txId);
      const outData = this.parseRevertData(txInfo, contract, method);
      result.txId = txId;
      result.log = txInfo.log;
      result.data = outData;

      //交易成功
      result.msg = "交易成功";
      result.state = "ok";
      return result;
    } catch (ex) {
      result.msg = ex.message;
      result.state = "error";
      return result;
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 等待交易确认
   */
  async getConfirmedTxInfo(
    txId,
    writeMsg = this.showLoading,
    maxRetries = 50,
    delay = 2000
  ) {
    let result = {};
    let retries = 0;
    if (txId) {
      this.showLoading("交易已上链，等待确认结果...");
    }
    await this.sleep(3000); // 初始延迟，避免立即查询
    let tronWebfConnector = window.tronWebConnector;
    if (tronWebfConnector == null) {
      console.error(" tronWebConnector 未初始化");
      return null;
    }
    const tronWeb = tronWebfConnector.getTronWeb();
    while (retries < maxRetries) {
      try {
        const txInfo = await tronWeb.trx.getTransactionInfo(txId);
        // 交易确认的标志：blockNumber > 0 且存在 result 字段
        if (txInfo?.blockNumber > 0) {
          return txInfo;
        }
        if (writeMsg != null) {
          writeMsg(`确认中，请稍后（${retries + 1}/${maxRetries}）...`);
        }
        retries++;
        await this.sleep(delay); // 延迟重试
      } catch (error) {
        if (writeMsg != null) {
          writeMsg(
            `查询交易信息失败（重试 ${retries + 1}/${maxRetries}）：`,
            error
          );
        }
        retries++;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("交易超时未确认");
  }

  /**
   * 显示加载状态
   * @param {string} message - 加载消息，默认为'加载中...'
   */
  showLoading(message = "加载中...") {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingMessage = document.getElementById("loadingMessage");
    if (loadingOverlay && loadingMessage) {
      loadingMessage.textContent = message;
      loadingOverlay.classList.remove("is-hidden");
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("is-hidden");
    }
  }

  async #loadConfig() {
    let response = await fetch("js/config.json");

    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    const config = await response.json();

    // 从fairstake.json加载ABI
    response = await fetch("js/fairstake.json");
    if (!response.ok) {
      throw new Error("Failed to load fairstake.json");
    }
    const fairstakeABI = await response.json();
    config.abis = {};
    config.abis.fairstake = fairstakeABI.ABI;
    // 从ierc20.json加载ABI
    response = await fetch("js/ierc20.json");
    if (!response.ok) {
      throw new Error("Failed to load ierc20.json");
    }
    try {
      const response = await fetch("/js/diamond.json");
      if (response.ok) {
        const diamondJson = await response.json();
        this.diamondABI = diamondJson.abi || diamondJson;
      } else throw new Error("Failed to load diamond ABI");
    } catch (err) {
      console.error("Could not load diamond ABI:", err);
      this.common.showMessage("error", "无法加载钻石合约 ABI");
    }
    const ierc20ABI = await response.json();
    config.abis.ierc20 = ierc20ABI;
    return config;
  }

  /**
   * 获取任意合约的链上事件
   * @param {string} contractAddress - 合约地址
   * @param {number} fromBlock - 起始区块
   * @param {number} toBlock - 结束区块
   * @returns {Promise} 包含事件列表的 Promise
   */
  async getContractEvents(contractAddress, eventName, fromBlock, toBlock) {
    try {
      const tronWeb = this.tronWebConnector.getReadTronWeb();
      const contractAddressHex = tronWeb.address.toHex(contractAddress);

      let eventOptions = {
        only_unconfirmed: false,
        only_confirmed: true,
        orderBy: "block_timestamp,desc",
        limit: 100,
      };

      // 添加块范围筛选
      if (fromBlock) {
        eventOptions.fromBlock = fromBlock;
      }
      if (toBlock) {
        eventOptions.toBlock = toBlock;
      }
      if (eventName) {
        eventOptions.eventName = eventName;
      }

      // 获取指定合约地址的所有事件
      const events = await tronWeb.event.getEventsByContractAddress(
        contractAddressHex,
        eventOptions
      );

      return events.data || [];
    } catch (error) {
      console.error(`get contract events (${contractAddress}):`, error);
      return [];
    }
  }

  async isDiamondOwner(diamondAddress) {
    try {
      const owner = await this.getOwnerAddress(diamondAddress);
      const currentAccount = this.tronWebConnector.getAccount();
      return owner === currentAccount;
    } catch (error) {
      console.error("检查是否是所有者失败:", error);
      throw error;
    }
  }
}
