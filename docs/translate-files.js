const fs = require('fs');
const path = require('path');

// 翻译映射：包含所有需要翻译的语言和翻译内容
const translations = {
  en: {
    network: {
      warnning: "Current environment is testnet, all transactions are only valid on testnet and will not affect mainnet.",
      disconnect: "Wallet disconnected",
      connect: {
        error: "Wallet connection failed"
      }
    },
    navigation: {
      doc: "Documentation",
      staking: "Staking",
      burn: "Burn",
      exchange: "Exchange",
      whitepaper: "Whitepaper",
      contributing: "Contributing",
      forum: "Forum",
      serviceagreement: "Service Agreement",
      privacypolicy: "Privacy Policy",
      disclaimers: "Disclaimers",
      legal: "Legal",
      contact: "Contact Us",
      email: "Email",
      phone: "Phone",
      address: "Address",
      governance: "Governance",
      mission: "Mission",
      about: "About Us",
      allrightsreserved: "All Rights Reserved",
      resources: "Resources",
      links: "Links",
      accountinfo: "Account Info",
      admin: {
        exchangeSetup: "Token Exchange Rate Setup"
      }
    },
    title: "FAIR Ecosystem",
    logs: {
      contractLogs: "Contract Logs",
      noData: "No operation records yet",
      table: {
        user: "Address",
        from: "From Address",
        eventName: "Operation",
        amount: "Amount",
        timestamp: "Time",
        status: "Status",
        transactionId: "Transaction Hash",
        tokenAmount: "Token Amount",
        frAmount: "FR Amount",
        fairAmount: "FAIR Amount",
        value: "Amount",
        to: "To Address",
        operator: "Operator"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Claim Reward",
        Withdrawn: "Withdrawn",
        UnstakeRequested: "Request Unstake",
        Paused: "Paused",
        Unpaused: "Unpaused",
        ContributorRewardMinted: "Contributor Reward Minted",
        Burnt: "Burnt",
        Transfer: "Transfer",
        Mint: "Mint",
        Burn: "Burn",
        Reward: "Reward",
        TokenExchanged: "Token Exchanged"
      },
      status: {
        success: "Success",
        pending: "Processing",
        failed: "Failed"
      }
    },
    admin: {
      title: "Admin Tools",
      exchange: {
        title: "Token Exchange Rate Setup"
      }
    },
    // home 模块翻译
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
        tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
      },
      stats: {
        global: {
          title: "Global Statistics"
        },
        currentNetwork: "Current Network",
        totalSupply: "Total FR Supply",
        totalStaked: "Total Staked FAIR",
        totalUnstaking: "Unstaking Amount",
        fairContract: "FAIR Contract Address",
        frContract: "FR Contract Address"
      },
      logs: {
        fairContract: "FAIR Logs",
        frContract: "FR Logs"
      }
    },
    // home-exchange 模块翻译
    home_exchange: {
      burn: {
        reward: {
          title: "代币兑换",
          amount: "销毁 FR 数量",
          placeholder: "请输入销毁数量",
          token: "奖励代币",
          token_placeholder: "请选择奖励代币",
          button: "销毁 FR",
          frBalance: "FR 代币余额"
        }
      },
      logs: {
        burnLogs: "销毁记录"
      },
      exchange: {
        notOpen: "兑换暂未开放",
        end: "已结束",
        startTime: "开始时间",
        endTime: "结束时间",
        remainingAmount: "剩余数量"
      }
    },
    // home-staking 模块翻译
    home_staking: {
      labels: {
        stakedFairBalance: "已质押 FAIR / FAIR 余额",
        earnedFrBalance: "可领取 FR / FR 余额",
        unstakeRequestAmount: "解押申请数量",
        unstakeCountdown: "解押倒计时",
        stakeAmountFair: "质押数量 (FAIR)",
        unstakeAmountFair: "解押数量 (FAIR)",
        unstakeWaitPeriod: "解押等待期"
      },
      buttons: {
        stake: "质押",
        claim: "领取",
        withdraw: "提取",
        requestUnstake: "申请解押",
        cancel: "取消",
        confirmStake: "确认质押",
        confirmUnstake: "确认解押申请",
        confirmClaim: "确认领取",
        refreshStats: "刷新统计数据",
        refreshLogs: "刷新日志"
      },
      modals: {
        stakeFair: "质押 FAIR",
        requestUnstake: "申请解押",
        claimRewards: "领取奖励",
        confirmClaim: "确认领取"
      },
      unstakeWaitDays: {
        "30days": "30 天",
        "15days": "15 天",
        "60days": "60 天"
      },
      placeholders: {
        enterStakeAmount: "请输入质押数量",
        enterUnstakeAmount: "请输入解押数量"
      },
      title: {
        stakeAndUnstake: "质押与解押",
        stakeOperations: "质押操作",
        unstakeOperations: "解押操作",
        operationsHistory: "操作历史",
        stakingRules: "质押与解押规则"
      },
      rules: {
        title: "质押与解押规则",
        item1: "您可以质押 FAIR 代币来获得 FR 代币奖励。FR 代币的收益率与质押的 FAIR 代币数量相关。最低年收益率为 1%，最高为 5%。质押的代币将锁定在智能合约中，每位用户的最大质押量为 35,000,000。",
        item2: "解押需要申请并等待一定时间。最低等待时间为 15 天，最高为 60 天。等待 60 天可免费解锁，每少等待一天需要支付解锁金额 0.2% 的手续费。",
        item3: "您需要每 180 天领取一次收益，否则 FR 代币生产将停止。请在操作前确保充分了解相关规则和风险。"
      }
    },
    // home-user 模块翻译
    home_user: {
      account: {
        info: {
          title: "账户信息"
        },
        balance: {
          trx: "TRX 余额",
          energy: "能量",
          bandwidth: "带宽",
          token: "代币余额",
          fair: "FAIR 余额",
          fr: "FR 余额"
        },
        actions: {
          claim: "领取"
        },
        buttons: {
          refresh: "刷新数据"
        }
      }
    }
  },
  // 其他语言翻译...
  ar: {
    network: {
      warnning: "البيئة الحالية هي شبكة اختبارية، وتكون جميع المعاملات صالحة فقط على الشبكة التجريبية ولا ستؤثر على الشبكة الرئيسية.",
      disconnect: "المحفظة مفصولة",
      connect: {
        error: "فشل الاتصال بالمحفظة"
      }
    },
    navigation: {
      doc: "الوثائق",
      staking: "الرهان",
      burn: "الحرق",
      exchange: "التبادل",
      whitepaper: "الوثيقة البيضاء",
      contributing: "المساهمة",
      forum: "المنتدى",
      serviceagreement: "اتفاقية الخدمة",
      privacypolicy: "سياسة الخصوصية",
      disclaimers: "الإخلاء من المسؤولية",
      legal: "القانون",
      contact: "اتصل بنا",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      governance: "الحكم",
      mission: "الرسالة",
      about: "عن الشركة",
      allrightsreserved: "كل الحقوق محفوظة",
      resources: "الموارد",
      links: "الروابط",
      accountinfo: "معلومات الحساب",
      admin: {
        exchangeSetup: "إعداد سعر التبادل للعملات"
      }
    },
    title: "نظام FAIR",
    logs: {
      contractLogs: "سجلات العقد",
      noData: "لا توجد سجلات عمليات حتى الآن",
      table: {
        user: "العنوان",
        from: "العنوان المرسل من",
        eventName: "العملية",
        amount: "المبلغ",
        timestamp: "الوقت",
        status: "الحالة",
        transactionId: "كود العملية",
        tokenAmount: "مبلغ العملة",
        frAmount: "مبلغ FR",
        fairAmount: "مبلغ FAIR",
        value: "القيمة",
        to: "العنوان المستلم",
        operator: "المشغل"
      },
      eventNames: {
        Staked: "رهان",
        Unstaked: "إلغاء الرهان",
        RewardClaimed: "استلام المكافأة",
        Withdrawn: "سحب",
        UnstakeRequested: "طلب إلغاء الرهان",
        Paused: "متوقف",
        Unpaused: "متابعة",
        ContributorRewardMinted: "铸造贡献奖励",
        Burnt: "محترق",
        Transfer: "تحويل",
        Mint: "铸造",
        Burn: "销毁",
        Reward: "奖励",
        TokenExchanged: "代币兑换"
      },
      status: {
        success: "ناجح",
        pending: "قيد المعالجة",
        failed: "فشل"
      }
    },
    admin: {
      title: "أدوات الإدارة",
      exchange: {
        title: "إعداد سعر التبادل للعملات"
      }
    },
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
        tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
      },
      stats: {
        global: {
          title: "Global Statistics"
        },
        currentNetwork: "Current Network",
        totalSupply: "Total FR Supply",
        totalStaked: "Total Staked FAIR",
        totalUnstaking: "Unstaking Amount",
        fairContract: "FAIR Contract Address",
        frContract: "FR Contract Address"
      },
      logs: {
        fairContract: "FAIR Logs",
        frContract: "FR Logs"
      }
    },
    home_staking: {
      rules: {
        title: "Staking & Unstaking Rules",
        item1: "You can stake FAIR tokens to earn FR token rewards. The FR token yield is related to the number of FAIR tokens staked. The minimum annual yield is 1%, and the maximum annual yield is 5%. Staked tokens will be locked in the smart contract, and the maximum staking amount per user is 35,000,000.",
        item2: "Unstaking requires an application and a waiting period. The minimum waiting time is 15 days, and the maximum is 60 days. Waiting 60 days allows free unlocking, and each day less waiting requires paying a 0.2% fee on the unlocking amount.",
        item3: "You need to claim earnings every 180 days, otherwise FR token production will stop. Please make sure to fully understand the relevant rules and risks before operating."
      }
    }
  },
  es: {
    network: {
      warnning: "El entorno actual es testnet, todas las transacciones son válidas solo en testnet y no afectarán a la mainnet.",
      disconnect: "Wallet desconectada",
      connect: {
        error: "Fallo en la conexión de wallet"
      }
    },
    navigation: {
      doc: "Documentación",
      staking: "Staking",
      burn: "Quemar",
      exchange: "Intercambio",
      whitepaper: "Whitepaper",
      contributing: "Contribución",
      forum: "Foro",
      serviceagreement: "Acuerdo de servicio",
      privacypolicy: "Política de privacidad",
      disclaimers: "Exenciones",
      legal: "Legal",
      contact: "Contacto",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      governance: "Gobernanza",
      mission: "Misión",
      about: "Sobre nosotros",
      allrightsreserved: "Todos los derechos reservados",
      resources: "Recursos",
      links: "Enlaces",
      accountinfo: "Información de cuenta",
      admin: {
        exchangeSetup: "Configuración del tipo de cambio de tokens"
      }
    },
    title: "Ecosistema FAIR",
    logs: {
      contractLogs: "Registros del contrato",
      noData: "Aún no hay registros de operaciones",
      table: {
        user: "Dirección",
        from: "Dirección de origen",
        eventName: "Operación",
        amount: "Cantidad",
        timestamp: "Hora",
        status: "Estado",
        transactionId: "Hash de la transacción",
        tokenAmount: "Cantidad de tokens",
        frAmount: "Cantidad de FR",
        fairAmount: "Cantidad de FAIR",
        value: "Valor",
        to: "Dirección de destino",
        operator: "Operador"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Reclamar recompensa",
        Withdrawn: "Retirado",
        UnstakeRequested: "Solicitar unstake",
        Paused: "Pausado",
        Unpaused: "Repausado",
        ContributorRewardMinted: "铸造贡献奖励",
        Burnt: "Quemado",
        Transfer: "Transferir",
        Mint: "Mint",
        Burn: "Quemar",
        Reward: "Recompensa",
        TokenExchanged: "Token intercambiado"
      },
      status: {
        success: "Exitoso",
        pending: "Procesando",
        failed: "Fallido"
      }
    },
    admin: {
      title: "Herramientas de administrador",
      exchange: {
        title: "Configuración del tipo de cambio de tokens"
      }
    },
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
        tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
      },
      stats: {
        global: {
          title: "Global Statistics"
        },
        currentNetwork: "Current Network",
        totalSupply: "Total FR Supply",
        totalStaked: "Total Staked FAIR",
        totalUnstaking: "Unstaking Amount",
        fairContract: "FAIR Contract Address",
        frContract: "FR Contract Address"
      },
      logs: {
        fairContract: "FAIR Logs",
        frContract: "FR Logs"
      }
    },
    home_staking: {
      rules: {
        title: "Staking & Unstaking Rules",
        item1: "You can stake FAIR tokens to earn FR token rewards. The FR token yield is related to the number of FAIR tokens staked. The minimum annual yield is 1%, and the maximum annual yield is 5%. Staked tokens will be locked in the smart contract, and the maximum staking amount per user is 35,000,000.",
        item2: "Unstaking requires an application and a waiting period. The minimum waiting time is 15 days, and the maximum is 60 days. Waiting 60 days allows free unlocking, and each day less waiting requires paying a 0.2% fee on the unlocking amount.",
        item3: "You need to claim earnings every 180 days, otherwise FR token production will stop. Please make sure to fully understand the relevant rules and risks before operating."
      }
    }
  },
  zh: {
    network: {
      warnning: "当前环境为测试网，所有交易仅在测试网有效，不会对主网产生影响。",
      disconnect: "钱包已断开连接",
      connect: {
        error: "连接钱包失败"
      }
    },
    navigation: {
      doc: "帮助文档",
      staking: "质押",
      burn: "销毁",
      exchange: "兑换",
      whitepaper: "白皮书",
      contributing: "参与贡献",
      forum: "社区论坛",
      serviceagreement: "服务协议",
      privacypolicy: "隐私政策",
      disclaimers: "免责声明",
      legal: "法律条款",
      contact: "联系我们",
      email: "电子邮箱",
      phone: "联系电话",
      address: "联系地址",
      governance: "治理",
      mission: "使命",
      about: "关于我们",
      allrightsreserved: "版权所有",
      resources: "资源中心",
      links: "相关链接",
      accountinfo: "账户信息",
      admin: {
        exchangeSetup: "代币汇率设置"
      }
    },
    title: "FAIR 生态系统",
    logs: {
      contractLogs: "合约日志",
      noData: "暂无操作记录",
      table: {
        user: "地址",
        from: "转出地址",
        eventName: "操作",
        amount: "数量",
        timestamp: "时间",
        status: "状态",
        transactionId: "交易哈希",
        tokenAmount: "代币数量",
        frAmount: "FR 数量",
        fairAmount: "FAIR 数量",
        value: "数量",
        to: "转入地址",
        operator: "操作者"
      },
      eventNames: {
        Staked: "质押",
        Unstaked: "解押",
        RewardClaimed: "领取奖励",
        Withdrawn: "提取",
        UnstakeRequested: "申请解押",
        Paused: "暂停",
        Unpaused: "恢复",
        ContributorRewardMinted: "铸造贡献奖励",
        Burnt: "销毁",
        Transfer: "转账",
        Mint: "铸造",
        Burn: "销毁",
        Reward: "奖励",
        TokenExchanged: "代币已兑换"
      },
      status: {
        success: "成功",
        pending: "处理中",
        failed: "失败"
      }
    },
    admin: {
      title: "管理工具",
      exchange: {
        title: "代币汇率设置"
      }
    },
    // home 模块翻译
    home: {
      warning: {
        title: "FR 代币说明",
        tip1: "FR 代币（FAIR 奖励代币）是 FAIR DAO 的奖励代币，初始发行量为 0。",
        tip2: "获取 FR 代币的方式：1. 通过质押 FAIR 代币领取；2. 通过参与 FAIR DAO 建设获得。",
        tip3: "FR 代币是兑换 FAIR DAO 收益的唯一凭证。所有 DAO 收益将转入 FR 合约，您只有通过销毁 FR 代币才能兑换 DAO 收益。"
      },
      stats: {
        global: {
          title: "全局统计"
        },
        currentNetwork: "当前网络",
        totalSupply: "FR 总供应量",
        totalStaked: "已质押 FAIR 总量",
        totalUnstaking: "解押中数量",
        fairContract: "FAIR 合约地址",
        frContract: "FR 合约地址"
      },
      logs: {
        fairContract: "FAIR 日志",
        frContract: "FR 日志"
      }
    },
    home_staking: {
      rules: {
        title: "质押与解押规则",
        item1: "您可以质押 FAIR 代币来获得 FR 代币奖励。FR 代币的收益率与质押的 FAIR 代币数量相关。最低年收益率为 1%，最高为 5%。质押的代币将锁定在智能合约中，每位用户的最大质押量为 35,000,000。",
        item2: "解押需要申请并等待一定时间。最低等待时间为 15 天，最高为 60 天。等待 60 天可免费解锁，每少等待一天需要支付解锁金额 0.2% 的手续费。",
        item3: "您需要每 180 天领取一次收益，否则 FR 代币生产将停止。请在操作前充分了解相关规则和风险。"
      }
    },
    home_exchange: {
      burn: {
        reward: {
          title: "代币兑换",
          amount: "销毁 FR 数量",
          placeholder: "请输入销毁数量",
          token: "奖励代币",
          token_placeholder: "请选择奖励代币",
          button: "销毁 FR",
          frBalance: "FR 代币余额"
        }
      },
      logs: {
        burnLogs: "销毁记录"
      },
      exchange: {
        notOpen: "兑换暂未开放",
        end: "已结束",
        startTime: "开始时间",
        endTime: "结束时间",
        remainingAmount: "剩余数量"
      }
    },
    home_user: {
      account: {
        info: {
          title: "账户信息"
        },
        balance: {
          trx: "TRX 余额",
          energy: "能量",
          bandwidth: "带宽",
          token: "代币余额",
          fair: "FAIR 余额",
          fr: "FR 余额"
        },
        actions: {
          claim: "领取"
        },
        buttons: {
          refresh: "刷新数据"
        }
      }
    }
  },
  ja: {
    ko: {
      network: {
        warnning: "Current environment is testnet, all transactions are only valid on testnet and will not affect mainnet.",
        disconnect: "Wallet disconnected",
        connect: {
          error: "Wallet connection failed"
        }
      },
      navigation: {
        doc: "문서",
        staking: "스테이킹",
        burn: "버닝",
        exchange: "교환",
        whitepaper: "백서",
        contributing: "기여",
        forum: "포럼",
        serviceagreement: "서비스 약관",
        privacypolicy: "개인 정보 보호 정책",
        disclaimers: "면책 사항",
        legal: "법적",
        contact: "문의하기",
        email: "이메일",
        phone: "전화",
        address: "주소",
        governance: "거버넌스",
        mission: "미션",
        about: "회사 소개",
        allrightsreserved: "All Rights Reserved",
        resources: "자원",
        links: "링크",
        accountinfo: "계정 정보",
        admin: {
          exchangeSetup: "Token Exchange Rate Setup"
        }
      },
      title: "FAIR Ecosystem",
      logs: {
        contractLogs: "Contract Logs",
        noData: "No operation records yet",
        table: {
          user: "Address",
          from: "From Address",
          eventName: "Operation",
          amount: "Amount",
          timestamp: "Time",
          status: "Status",
          transactionId: "Transaction Hash",
          tokenAmount: "Token Amount",
          frAmount: "FR Amount",
          fairAmount: "FAIR Amount",
          value: "Amount",
          to: "To Address",
          operator: "Operator"
        },
        eventNames: {
          Staked: "Staked",
          Unstaked: "Unstaked",
          RewardClaimed: "Claim Reward",
          Withdrawn: "Withdrawn",
          UnstakeRequested: "Request Unstake",
          Paused: "Paused",
          Unpaused: "Unpaused",
          ContributorRewardMinted: "Contributor Reward Minted",
          Burnt: "Burnt",
          Transfer: "Transfer",
          Mint: "Mint",
          Burn: "Burn",
          Reward: "Reward",
          TokenExchanged: "Token Exchanged"
        },
        status: {
          success: "Success",
          pending: "Processing",
          failed: "Failed"
        }
      },
      admin: {
        title: "Admin Tools",
        exchange: {
          title: "Token Exchange Rate Setup"
        }
      },
      home: {
        warning: {
          title: "FR Token Description",
          tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
          tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
          tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
        },
        stats: {
          global: {
            title: "Global Statistics"
          },
          currentNetwork: "Current Network",
          totalSupply: "Total FR Supply",
          totalStaked: "Total Staked FAIR",
          totalUnstaking: "Unstaking Amount",
          fairContract: "FAIR Contract Address",
          frContract: "FR Contract Address"
        },
        logs: {
          fairContract: "FAIR Logs",
          frContract: "FR Logs"
        }
      },
      home_staking: {
        rules: {
          title: "Staking & Unstaking Rules",
          item1: "You can stake FAIR tokens to earn FR token rewards. The FR token yield is related to the number of FAIR tokens staked. The minimum annual yield is 1%, and the maximum annual yield is 5%. Staked tokens will be locked in the smart contract, and the maximum staking amount per user is 35,000,000.",
          item2: "Unstaking requires an application and a waiting period. The minimum waiting time is 15 days, and the maximum is 60 days. Waiting 60 days allows free unlocking, and each day less waiting requires paying a 0.2% fee on the unlocking amount.",
          item3: "You need to claim earnings every 180 days, otherwise FR token production will stop. Please make sure to fully understand the relevant rules and risks before operating."
        }
      }
    },
    // home-user 模块翻译
    home_user: {
      account: {
        info: {
          title: "账户信息"
        },
        balance: {
          trx: "TRX 余额",
          energy: "能量",
          bandwidth: "带宽",
          token: "代币余额",
          fair: "FAIR 余额",
          fr: "FR 余额"
        },
        actions: {
          claim: "领取"
        },
        buttons: {
          refresh: "刷新数据"
        }
      }
    }
  },
  th: {
    network: {
      warnning: "Current environment is testnet, all transactions are only valid on testnet and will not affect mainnet.",
      disconnect: "Wallet disconnected",
      connect: {
        error: "Wallet connection failed"
      }
    },
    navigation: {
      doc: "Documentation",
      staking: "Staking",
      burn: "Burn",
      exchange: "Exchange",
      whitepaper: "Whitepaper",
      contributing: "Contributing",
      forum: "Forum",
      serviceagreement: "Service Agreement",
      privacypolicy: "Privacy Policy",
      disclaimers: "Disclaimers",
      legal: "Legal",
      contact: "Contact Us",
      email: "Email",
      phone: "Phone",
      address: "Address",
      governance: "Governance",
      mission: "Mission",
      about: "About Us",
      allrightsreserved: "All Rights Reserved",
      resources: "Resources",
      links: "Links",
      accountinfo: "Account Info",
      admin: {
        exchangeSetup: "Token Exchange Rate Setup"
      }
    },
    title: "FAIR Ecosystem",
    logs: {
      contractLogs: "Contract Logs",
      noData: "No operation records yet",
      table: {
        user: "Address",
        from: "From Address",
        eventName: "Operation",
        amount: "Amount",
        timestamp: "Time",
        status: "Status",
        transactionId: "Transaction Hash",
        tokenAmount: "Token Amount",
        frAmount: "FR Amount",
        fairAmount: "FAIR Amount",
        value: "Amount",
        to: "To Address",
        operator: "Operator"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Claim Reward",
        Withdrawn: "Withdrawn",
        UnstakeRequested: "Request Unstake",
        Paused: "Paused",
        Unpaused: "Unpaused",
        ContributorRewardMinted: "Contributor Reward Minted",
        Burnt: "Burnt",
        Transfer: "Transfer",
        Mint: "Mint",
        Burn: "Burn",
        Reward: "Reward",
        TokenExchanged: "Token Exchanged"
      },
      status: {
        success: "Success",
        pending: "Processing",
        failed: "Failed"
      }
    },
    admin: {
      title: "Admin Tools",
      exchange: {
        title: "Token Exchange Rate Setup"
      }
    },
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
        tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
      },
      stats: {
        global: {
          title: "Global Statistics"
        },
        currentNetwork: "Current Network",
        totalSupply: "Total FR Supply",
        totalStaked: "Total Staked FAIR",
        totalUnstaking: "Unstaking Amount",
        fairContract: "FAIR Contract Address",
        frContract: "FR Contract Address"
      },
      logs: {
        fairContract: "FAIR Logs",
        frContract: "FR Logs"
      }
    },
    home_staking: {
      rules: {
        title: "Staking & Unstaking Rules",
        item1: "You can stake FAIR tokens to earn FR token rewards. The FR token yield is related to the number of FAIR tokens staked. The minimum annual yield is 1%, and the maximum annual yield is 5%. Staked tokens will be locked in the smart contract, and the maximum staking amount per user is 35,000,000.",
        item2: "Unstaking requires an application and a waiting period. The minimum waiting time is 15 days, and the maximum is 60 days. Waiting 60 days allows free unlocking, and each day less waiting requires paying a 0.2% fee on the unlocking amount.",
        item3: "You need to claim earnings every 180 days, otherwise FR token production will stop. Please make sure to fully understand the relevant rules and risks before operating."
      }
    }
  },
  vi: {
    network: {
      warnning: "Current environment is testnet, all transactions are only valid on testnet and will not affect mainnet.",
      disconnect: "Wallet disconnected",
      connect: {
        error: "Wallet connection failed"
      }
    },
    navigation: {
      doc: "Tài liệu",
      staking: "Staking",
      burn: "Burn",
      exchange: "Exchange",
      whitepaper: "Whitepaper",
      contributing: "Contributing",
      forum: "Diễn đàn",
      serviceagreement: "Thỏa thuận dịch vụ",
      privacypolicy: "Chính sách bảo mật",
      disclaimers: "Từ chối trách nhiệm",
      legal: "Legal",
      contact: "Liên hệ",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      governance: "Quy định",
      mission: "Nhiệm vụ",
      about: "Về chúng tôi",
      allrightsreserved: "All Rights Reserved",
      resources: "Tài nguyên",
      links: "Liên kết",
      accountinfo: "Thông tin tài khoản",
      admin: {
        exchangeSetup: "Token Exchange Rate Setup"
      }
    },
    title: "FAIR Ecosystem",
    logs: {
      contractLogs: "Contract Logs",
      noData: "No operation records yet",
      table: {
        user: "Address",
        from: "From Address",
        eventName: "Operation",
        amount: "Amount",
        timestamp: "Time",
        status: "Status",
        transactionId: "Transaction Hash",
        tokenAmount: "Token Amount",
        frAmount: "FR Amount",
        fairAmount: "FAIR Amount",
        value: "Amount",
        to: "To Address",
        operator: "Operator"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Claim Reward",
        Withdrawn: "Withdrawn",
        UnstakeRequested: "Request Unstake",
        Paused: "Paused",
        Unpaused: "Unpaused",
        ContributorRewardMinted: "Contributor Reward Minted",
        Burnt: "Burnt",
        Transfer: "Transfer",
        Mint: "Mint",
        Burn: "Burn",
        Reward: "Reward",
        TokenExchanged: "Token Exchanged"
      },
      status: {
        success: "Success",
        pending: "Processing",
        failed: "Failed"
      }
    },
    admin: {
      title: "Admin Tools",
      exchange: {
        title: "Token Exchange Rate Setup"
      }
    },
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: 1. Claim by staking FAIR tokens; 2. Obtain by participating in FAIR DAO construction.",
        tip3: "FR Token is the only proof for exchanging FAIR DAO earnings. All DAO earnings will be transferred to FR contract, and you can only exchange DAO earnings by burning FR tokens."
      },
      stats: {
        global: {
          title: "Global Statistics"
        },
        currentNetwork: "Current Network",
        totalSupply: "Total FR Supply",
        totalStaked: "Total Staked FAIR",
        totalUnstaking: "Unstaking Amount",
        fairContract: "FAIR Contract Address",
        frContract: "FR Contract Address"
      },
      logs: {
        fairContract: "FAIR Logs",
        frContract: "FR Logs"
      }
    },
    home_staking: {
      rules: {
        title: "Staking & Unstaking Rules",
        item1: "You can stake FAIR tokens to earn FR token rewards. The FR token yield is related to the number of FAIR tokens staked. The minimum annual yield is 1%, and the maximum annual yield is 5%. Staked tokens will be locked in the smart contract, and the maximum staking amount per user is 35,000,000.",
        item2: "Unstaking requires an application and a waiting period. The minimum waiting time is 15 days, and the maximum is 60 days. Waiting 60 days allows free unlocking, and each day less waiting requires paying a 0.2% fee on the unlocking amount.",
        item3: "You need to claim earnings every 180 days, otherwise FR token production will stop. Please make sure to fully understand the relevant rules and risks before operating."
      }
    }
  }
};

// 生成翻译文件的函数
function generateTranslationFiles() {
  const modules = ['admin-exchange', 'home', 'home-exchange', 'home-staking', 'home-user'];
  const languages = Object.keys(translations).filter(lang => lang !== 'en');

  // 生成根目录的 i18n 文件
  languages.forEach(lang => {
    const filePath = path.join(__dirname, 'i18n', `${lang}.json`);
    const rootTranslations = {
      network: translations[lang]?.network || translations.en.network,
      navigation: translations[lang]?.navigation || translations.en.navigation,
      title: translations[lang]?.title || translations.en.title,
      logs: translations[lang]?.logs || translations.en.logs,
      admin: translations[lang]?.admin || translations.en.admin
    };
    fs.writeFileSync(filePath, JSON.stringify(rootTranslations, null, 2));
    console.log(`  ✓ 已生成根 i18n 文件: ${filePath}`);
  });

  // 生成各模块的 i18n 文件
  modules.forEach(module => {
    const moduleKey = module.replace(/-/g, '_');
    languages.forEach(lang => {
      const enModule = translations.en[moduleKey];
      const zhModule = translations.zh[moduleKey]; // 中文为基准
      const targetModule = translations[lang][moduleKey];
  
      // 如果没有英文模块或中文模块定义，跳过
      if (!enModule || !zhModule) {
        console.log(`  ✓ 跳过 ${module} 模块，没有英文或中文翻译定义`);
        return;
      }
  
      // 递归合并翻译，以中文为基准
      function mergeTranslation(target, source) {
        if (!source || typeof source !== 'object') {
          return target;
        }
        Object.keys(source).forEach(key => {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            target[key] = mergeTranslation(target[key] || {}, source[key]);
          } else {
            // 对于中文翻译，直接使用中文基准
            if (lang === 'zh') {
              target[key] = zhModule?.[key] || source[key];
            } else {
              // 对于其他语言，先使用目标语言翻译，再使用中文基准，最后使用英文
              target[key] = targetModule?.[key] || zhModule?.[key] || source[key];
            }
          }
        });
        return target;
      }
  
      // 合并翻译
      const mergedTranslations = mergeTranslation({}, enModule);
  
      // 写入文件
      const dirPath = path.join(__dirname, module, 'i18n');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const filePath = path.join(dirPath, `${lang}.json`);
      fs.writeFileSync(filePath, JSON.stringify(mergedTranslations, null, 2));
      console.log(`  ✓ 已生成 ${module} 模块: ${filePath}`);
    });
  });

  console.log('\n所有翻译文件生成完成！');
}

// 运行翻译文件生成函数
generateTranslationFiles();