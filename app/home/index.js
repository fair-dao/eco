class HomeModule {
  static lastInstance = null;
  constructor() {
    HomeModule.lastInstance = this;
    this.homeModule = document.getElementById("homeModule");
  }

  async init() {
    try {
      console.log("HomeModule 初始化...");
      
      // 初始化多语言支持
      try {
        await this.i18n();
      } catch(ex) {
        console.log(ex);
      }

      // 获取 tronWebConnector
      this.tronWebConnector = window.tronWebConnector;
      
      // 获取合约交互模块
      this.contractInteraction = window.contractInteraction;
      
      // 获取公共工具模块
      this.common = window.fairStakeCommon;
      this.startDataRefreshTimer();
      return this;
    } catch (error) {
      console.error("HomeModule 初始化错误:", error);
      return false;
    }
  }

  /**
   *  本地化
   */
  async loadLocale() {
    let lang = this.common.lang;
    let locale = await this.common.loadLocale(lang);
    return locale;
  }

  /**
   * 启动数据定时刷新功能
   * 每1分钟调用一次loadUserData方法，同时更新用户数据和全局统计
   */
  startDataRefreshTimer(time = 10) {
    const me = this;
    setTimeout(async () => {
      try {
        if (HomeModule.lastInstance === me) {
          if (this.common.network) {
            var frContractAddress = document.getElementById("frContractAddress");
            if (frContractAddress) {
              frContractAddress.value = this.common.network.rewardToken.address;
            }
            var fairContractAddress = document.getElementById("fairContractAddress");
            if (fairContractAddress) {
              fairContractAddress.value = this.common.network.stakedToken.address;
            }

            // 调用合并方法同时更新用户数据和全局统计，传递isAutoRefresh=true参数
            await this.updateGlobalStats(true);
          }
        } else return;
      } catch (error) {
        console.error("定时刷新数据时出错:", error);
      }
      me.startDataRefreshTimer(10000);
    }, time);
  }

  /**
   * 更新全局统计数据
   */
  async updateGlobalStats(isAutoRefresh) {
    // 自动刷新时，只旋转全局统计右上角的刷新图标
    const refreshBtn = document.getElementById("refreshStatsBtn");
    if (!refreshBtn) return;
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
      // 获取FR总供应量
      const totalSupplyResult = await this.contractInteraction.totalSupply();
      // 获取FAIR总质押量
      const totalStakedResult = await this.contractInteraction.totalStaked();
      // 获取FAIR正在解押数量
      const totalUnstakingResult = await this.contractInteraction.totalUnstaking();

      // 更新UI
      const frTotalSupplyElement = document.getElementById("frTotalSupply");
      const fairTotalStakedElement = document.getElementById("fairTotalStaked");
      const fairTotalUnstakingElement = document.getElementById("fairTotalUnstaking");

      if (frTotalSupplyElement) {
        frTotalSupplyElement.value = totalSupplyResult.success ? totalSupplyResult.data : "0.00";
      }

      if (fairTotalStakedElement) {
        fairTotalStakedElement.value = totalStakedResult.success ? totalStakedResult.data : "0.00";
      }

      if (fairTotalUnstakingElement) {
        fairTotalUnstakingElement.value = totalUnstakingResult.success ? totalUnstakingResult.data : "0.00";
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
        const loadingIndicator = document.getElementById("dataLoadingIndicator");
        if (loadingIndicator) {
          loadingIndicator.classList.add("is-hidden");
        }
      }
    }
  }
}

export default HomeModule;