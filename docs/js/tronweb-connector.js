/**
 * TronWeb钱包连接模块
 * 负责处理与波场钱包的连接、断开、账户监听等功能
 */

class TronWebConnector {
  constructor() {
    this.innerTronWeb=null;
    this.inited = false;
    this.isConnected = false;
    this.isTest = false;
    this.common = window.fairStakeCommon;
    this.networkId = null;
    this.listeners = {
      connected: [],
      disconnected: [],
      accountsChanged: [],
      networkChanged: [],
    };
  }

  async getAccount(){
    let tronWeb=this.getTronWeb();
    return tronWeb.defaultAddress.base58;
  }

  #readTronWebs={};

  getReadTronWeb(){
    const network=this.common.network;
    const curNetworkName=network.name;
    if(this.#readTronWebs[curNetworkName]){
      return this.#readTronWebs[curNetworkName];
    }else {
         const TronWeb = window.TronWeb.TronWeb;
         const web = new TronWeb({
          fullHost: network.fullNode,
          solidityNode: network.solidityNode,
          eventServer: network.eventServer
        });
       this.#readTronWebs[curNetworkName]=web;
       return web;
    }
  }

  /**
   * 初始化TronWeb实例
   */
  async init() {
   
      // 检查是否安装了TronLink并请求账户信息
      if (window.tronWeb) {
        try {
          // 按照TronLink推荐，尽早请求用户账户信息以获取完整的TronWeb注入
          if (window.tronWeb.request) {
            // 使用新版TronLink API请求账户
            await window.tronWeb.request({ method: "tron_requestAccounts" });
          } else if (window.tronWeb.ready) {
            // 旧版TronLink API兼容
            await window.tronWeb.ready;
          }
        } catch (error) {
          console.log(
            "Wallet connection requested but user may not have authorized yet:",
            error
          );
          // 继续执行，不阻止初始化流程
        }

        // 更新连接状态
        if (window.tronWeb.defaultAddress.base58) {
          this.tronWeb = window.tronWeb;
          this.isConnected = true;
          this.notifyListeners("connected");
        }
         this.setupEventListeners();
     
      }
      const TronWeb = window.TronWeb.TronWeb;
      this.mnemonic =
          "crash special upset cruise garment laundry armed arena unaware marriage robot analyst";
        const privateKeys = [
          "0x91d4109ebf89645046549af9587b126dd31e380d14d2ee08d778b6660489ffcb",
          "0xe8e5f2f739c36cdd749a669d97c76380b41ecfde11a3a2466f8f482c752a83cc",
          "0xcf362dd723b531f963e8c55dd98e945d9adcb3eed91d746c6ceaa14e04a87d9f",
          "0x2bf32659df81bb32e7b398b9a9d369b2bfb5978889a397cbaf23186842322614",
          "0x627094b9c43638f4aa451925fcb0e9a7d2e5a6e59e62f5f1cabcb8bd137c9afe",
        ];
        // Randomly pick one private key from the array
        const privateKey = privateKeys[Math.floor(Math.random() * privateKeys.length)].slice(2);
        this.innerTronWeb = new TronWeb({
          fullHost: "https://nile.trongrid.io",
          solidityNode: "https://nile.trongrid.io",
          eventServer: "https://nile.trongrid.io",
          privateKey: privateKey,
        });
      if(!window.tronWeb){
        this.isConnected = true;
        this.notifyListeners("connected");
     }      
    this.inited = true;
  }

  /**
   * 设置钱包事件监听
   */
  setupEventListeners() {
    // 监听账户变更（如果钱包支持）
    if (window.addEventListener) {
      window.addEventListener("message", this.handleMessage.bind(this));
    }

    // 定期检查连接状态
    setInterval(this.checkConnectionStatus.bind(this), 3000);
  }

  /**
   * 处理钱包消息
   */
  handleMessage(event) {
    try {
      const { message } = event.data;
      if (!message) return;
      if (message.action !== "tabReply") {
        console.log("收到钱包消息:", message);
      }
      if (message.action) {
        switch (message.action) {
          case "tabReply":
            return;
          case "setNode":
            this.isConnected = true;
            this.notifyListeners("connected");            
            return;
          case "accountsChanged":
            if (!this.isConnected) {
              this.connect();
              return;
            }
            this.account = message.data?.address;
            this.notifyListeners("accountsChanged", { account: this.account });
            return;
        }
      }

      switch (message.type) {
        case "tronLink::accountsChanged":
          const newAccount = message.data?.[0];
          if (newAccount && newAccount !== this.account) {
            this.account = newAccount;
            this.notifyListeners("accountsChanged", { account: this.account });
          }
          break;
        case "tronLink::networkChanged":
          const newNetworkId = message.data;
          if (newNetworkId !== this.networkId) {
            this.networkId = newNetworkId;
            this.notifyListeners("networkChanged", {
              networkId: this.networkId,
            });
          }
          break;
        case "tronLink::connected":
          if (message.data === true) {
            this.isConnected = true;
            this.account = window.tronWeb.defaultAddress.base58;
            this.notifyListeners("connected", {
              account: this.account,
              networkId: this.networkId,
            });
          }
          break;
        case "tronLink::disconnected":
          this.isConnected = false;
          this.account = null;
          this.notifyListeners("disconnected");
          break;
      }
    } catch (error) {
      console.error("处理钱包消息错误:", error);
    }
  }

  /**
   * 检查连接状态
   */
  checkConnectionStatus() {
    try {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        const currentAccount = window.tronWeb.defaultAddress.base58;

        // 账户变更检测
        if (currentAccount !== this.account) {
          if (!this.account) {
            // 首次连接
            this.isConnected = true;
            this.account = currentAccount;
            this.notifyListeners("connected", {
              account: this.account,
              networkId: this.networkId,
            });
          } else {
            // 账户切换
            this.account = currentAccount;
            this.notifyListeners("accountsChanged", { account: this.account });
          }
        }
      } else if (this.isConnected) {
        // 断开连接
        this.isConnected = false;
        this.account = null;
        this.notifyListeners("disconnected");
      }
    } catch (error) {
      console.error("检查连接状态错误:", error);
    }
  }

  /**
   * 连接钱包
   */
  async connect() {
    try {
      console.log("connect1");
      // 显示加载状态
      this.common.showLoading("正在连接钱包...");

      // 检查是否安装了TronLink
      if (!window.tronWeb) {
        throw new Error("请安装TronLink钱包插件");
      }

      // 请求授权
      if (window.tronWeb.request) {
        // 新版TronLink API
        await window.tronWeb.request({ method: "tron_requestAccounts" });
      } else {
        // 旧版TronLink API
        await window.tronWeb.ready;
      }

      // 更新状态
      this.tronWeb = window.tronWeb;
      this.isConnected = true;
      this.account = window.tronWeb.defaultAddress.base58;

      // 隐藏加载状态
      this.common.hideLoading();

      // 通知监听器
      this.notifyListeners("connected", {
        account: this.account,
        networkId: this.networkId,
      });

      return {
        success: true,
        account: this.account,
        networkId: this.networkId,
      };
    } catch (error) {
      this.common.hideLoading();
      this.common.showMessage("error", "连接钱包失败: " + error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 断开钱包连接
   */
  disconnect() {
    try {
      this.isConnected = false;
      this.account = null;
      this.notifyListeners("disconnected");
      return { success: true };
    } catch (error) {
      console.error("断开钱包连接错误:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取当前账户地址
   */
  getAccount() {
    return this.account;
  }

  /**
   * 获取当前网络ID
   */
  getNetworkId() {
    return this.networkId;
  }

  /**
   * 获取TronWeb实例
   */
  getTronWeb() {    
    if (window.tronWeb && window.tronWeb.isConnected) {
      return window.tronWeb;
    }else{
       return this.innerTronWeb;
    }

  }

  /**
   * 检查是否已连接
   */
  getIsConnected() {
    return this.isConnected;
  }

  /**
   * 添加事件监听器
   */
  on(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
    }
  }

  /**
   * 移除事件监听器
   */
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

  /**
   * 通知所有监听器
   */
  notifyListeners(eventName, data = {}) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`触发${eventName}监听器错误:`, error);
        }
      });
    }
  }
}
