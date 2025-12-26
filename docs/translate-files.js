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
    // admin-exchange 模块翻译
    admin_exchange: {
      title: {
        exchangeRateConfig: "Token Exchange Rate Setup"
      },
      labels: {
        tokenAddress: "Token Address",
        tokenDecimals: "Token Decimals",
        contractTokenBalance: "Contract Token Balance",
        exchangeRate: "Exchange Rate",
        maxExchangeAmount: "Max Exchange Amount",
        tokenType: "Token Type",
        duration: "Duration",
        frToken: "FR Token"
      },
      buttons: {
        setExchangeRate: "Set Token Exchange Rate"
      },
      help: {
        selectToken: "Select token to set exchange rate",
        exchangeRate: "Set the exchange relationship between target token and FR token, numerator and denominator will be calculated automatically",
        maxExchangeAmount: "Set the maximum exchange amount for this token, 255 means unlimited",
        tokenType: "Select transfer method after token exchange",
        duration: "Set the duration for this exchange rate"
      },
      options: {
        standardErc20: "Standard ERC20",
        nonStandardErc20: "Non-Standard ERC20"
      },
      duration: {
        "1week": "1 Week",
        "2weeks": "2 Weeks",
        "5weeks": "5 Weeks",
        "9weeks": "9 Weeks",
        "13weeks": "13 Weeks",
        "55weeks": "55 Weeks",
        "permanent": "Permanent"
      },
      placeholders: {
        selectToken: "Please select token",
        enterFrAmount: "Enter FR amount",
        enterMaxExchangeAmount: "Enter max exchange amount",
        unknown: "--"
      }
    },
    // home 模块翻译
    home: {
      warning: {
        title: "FR Token Description",
        tip1: "FR Token (FAIR Reward Token) is the reward token of FAIR DAO, initial supply is 0.",
        tip2: "Ways to obtain FR tokens: Claim by staking FAIR tokens, up to 90 days of earnings can be claimed each time; Obtain by participating in FAIR DAO construction.",
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
          title: "Token Exchange",
          amount: "Burn FR Amount",
          placeholder: "Enter burn amount",
          token: "Reward Token",
          token_placeholder: "Please select reward token",
          button: "Burn FR",
          frBalance: "FR Token Balance"
        }
      },
      logs: {
        burnLogs: "Burn Logs"
      },
      exchange: {
        notOpen: "Exchange not opened",
        end: "Ended",
        startTime: "Start Time",
        endTime: "End Time",
        remainingAmount: "Remaining"
      }
    },
    // home-staking 模块翻译
    home_staking: {
      labels: {
        stakedFairBalance: "Staked FAIR / FAIR Balance",
        earnedFrBalance: "Claimable FR / FR Balance",
        unstakeRequestAmount: "Unstake Request Amount",
        unstakeCountdown: "Unstake Countdown",
        stakeAmountFair: "Stake Amount (FAIR)",
        unstakeAmountFair: "Unstake Amount (FAIR)",
        unstakeWaitPeriod: "Unstake Waiting Period"
      },
      buttons: {
        stake: "Stake",
        claim: "Claim",
        withdraw: "Withdraw",
        requestUnstake: "Request Unstake",
        cancel: "Cancel",
        confirmStake: "Confirm Stake",
        confirmUnstake: "Confirm Unstake Request",
        confirmClaim: "Confirm Claim",
        refreshStats: "Refresh Statistics",
        refreshLogs: "Refresh Logs"
      },
      modals: {
        stakeFair: "Stake FAIR",
        requestUnstake: "Request Unstake",
        claimRewards: "Claim Rewards",
        confirmClaim: "Confirm to claim rewards?"
      },
      unstakeWaitDays: {
        "30days": "30 Days",
        "15days": "15 Days",
        "60days": "60 Days"
      },
      placeholders: {
        enterStakeAmount: "Please enter stake amount",
        enterUnstakeAmount: "Please enter unstake amount"
      },
      title: {
        stakeAndUnstake: "Stake & Unstake",
        stakeOperations: "Stake Operations",
        unstakeOperations: "Unstake Operations",
        operationsHistory: "Operations History"
      }
    },
    // home-user 模块翻译
    home_user: {
      account: {
        info: {
          title: "Account Info"
        },
        balance: {
          trx: "TRX Balance",
          energy: "Energy",
          bandwidth: "Bandwidth",
          token: "Token Balance",
          fair: "FAIR Balance",
          fr: "FR Balance"
        },
        actions: {
          claim: "Claim"
        },
        buttons: {
          refresh: "Refresh Data"
        }
      }
    }
  },
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
        Burn: "حريق",
        Reward: "مكافأة",
        TokenExchanged: "تبادل العملة"
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
        ContributorRewardMinted: "Recompensa de contribución minted",
        Burnt: "Quemado",
        Transfer: "Transferido",
        Mint: "Mint",
        Burn: "Quemar",
        Reward: "Recompensa",
        TokenExchanged: "Token intercambiado"
      },
      status: {
        success: "Éxito",
        pending: "Procesando",
        failed: "Fallido"
      }
    },
    admin: {
      title: "Herramientas de administración",
      exchange: {
        title: "Configuración del tipo de cambio de tokens"
      }
    }
  },
  hi: {
    network: {
      warnning: "वर्तमाव हिसकल हिस्पतन है, सभी लेनदेन केवल हिस्पतन पर मान्य हैं और मैनिनेट को प्रभावित नहीं करेंगे।",
      disconnect: "वॉलेट डिस्कनेक्ट",
      connect: {
        error: "वॉलेट कनेक्शन विफल"
      }
    },
    navigation: {
      doc: "प्रलेखन",
      staking: "स्टेकिंग",
      burn: "बर्न",
      exchange: "एक्सचेंज",
      whitepaper: "व्हाइटपेपर",
      contributing: "योगदान",
      forum: "फोरम",
      serviceagreement: "सेवा समझौता",
      privacypolicy: "गोपनीयता नीति",
      disclaimers: "अस्वीकरण",
      legal: "कानूनी",
      contact: "संपर्क करें",
      email: "ईमेल",
      phone: "फोन",
      address: "पता",
      governance: "शासन",
      mission: "मिशन",
      about: "हमारे बारे में",
      allrightsreserved: "सभी अधिकार सुरक्षित",
      resources: "संसाधन",
      links: "लिंक",
      accountinfo: "खाता जानकारी",
      admin: {
        exchangeSetup: "टोकन विनिमय दर सेटअप"
      }
    },
    title: "फेयर इकोसिस्टम",
    logs: {
      contractLogs: "संविदा लॉग",
      noData: "अभी तक कोई ऑपरेशन रिकॉर्ड नहीं",
      table: {
        user: "पता",
        from: "आधिकार पता",
        eventName: "ऑपरेशन",
        amount: "राशि",
        timestamp: "समय",
        status: "स्थिति",
        transactionId: "लेनदेन हैश",
        tokenAmount: "टोकन राशि",
        frAmount: "FR राशि",
        fairAmount: "फेयर राशि",
        value: "मूल्य",
        to: "प्राप्तकर्ता पता",
        operator: "ऑपरेटर"
      },
      eventNames: {
        Staked: "स्टेक किया",
        Unstaked: "अनस्टेक किया",
        RewardClaimed: "पुरस्कार दावा किया",
        Withdrawn: "निकाला",
        UnstakeRequested: "अनस्टेक अनुरोध किया",
        Paused: "रोक दिया",
        Unpaused: "जारी रखा",
        ContributorRewardMinted: "योगदानकर्ता पुरस्कार मिंट किया",
        Burnt: "जलाया",
        Transfer: "स्थानांतरित",
        Mint: "मिंट",
        Burn: "बर्न",
        Reward: "पुरस्कार",
        TokenExchanged: "टोकन विनिमय किया"
      },
      status: {
        success: "सफल",
        pending: "प्रोसेसिंग",
        failed: "विफल"
      }
    },
    admin: {
      title: "एडमिन टूल",
      exchange: {
        title: "टोकन विनिमय दर सेटअप"
      }
    }
  },
  fr: {
    network: {
      warnning: "L'environnement actuel est un testnet, toutes les transactions ne sont valides que sur le testnet et n'affecteront pas le mainnet.",
      disconnect: "Wallet déconnecté",
      connect: {
        error: "Échec de la connexion du wallet"
      }
    },
    navigation: {
      doc: "Documentation",
      staking: "Staking",
      burn: "Brûler",
      exchange: "Échange",
      whitepaper: "Whitepaper",
      contributing: "Contribution",
      forum: "Forum",
      serviceagreement: "Contrat de service",
      privacypolicy: "Politique de confidentialité",
      disclaimers: "Avertissements",
      legal: "Légal",
      contact: "Contact",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      governance: "Gouvernance",
      mission: "Mission",
      about: "À propos",
      allrightsreserved: "Tous droits réservés",
      resources: "Ressources",
      links: "Liens",
      accountinfo: "Informations du compte",
      admin: {
        exchangeSetup: "Configuration du taux d'échange des tokens"
      }
    },
    title: "Écosystème FAIR",
    logs: {
      contractLogs: "Journaux de contrat",
      noData: "Aucun enregistrement d'opération pour le moment",
      table: {
        user: "Adresse",
        from: "Adresse d'origine",
        eventName: "Opération",
        amount: "Montant",
        timestamp: "Heure",
        status: "Statut",
        transactionId: "Hash de transaction",
        tokenAmount: "Montant de tokens",
        frAmount: "Montant de FR",
        fairAmount: "Montant de FAIR",
        value: "Valeur",
        to: "Adresse de destination",
        operator: "Opérateur"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Réclamer une récompense",
        Withdrawn: "Retiré",
        UnstakeRequested: "Demander un unstake",
        Paused: "En pause",
        Unpaused: "Repris",
        ContributorRewardMinted: "Récompense de contributeur mintée",
        Burnt: "Brûlé",
        Transfer: "Transféré",
        Mint: "Mint",
        Burn: "Brûler",
        Reward: "Récompense",
        TokenExchanged: "Token échangé"
      },
      status: {
        success: "Succès",
        pending: "En cours",
        failed: "Échec"
      }
    },
    admin: {
      title: "Outils d'administration",
      exchange: {
        title: "Configuration du taux d'échange des tokens"
      }
    }
  },
  ja: {
    network: {
      warnning: "現在の環境はテストネットです。全ての取引はテストネットでのみ有効で、メインネットには影響を与えません。",
      disconnect: "ウォレットが切断されました",
      connect: {
        error: "ウォレット接続に失敗しました"
      }
    },
    navigation: {
      doc: "ドキュメント",
      staking: "ステーキング",
      burn: "バーン",
      exchange: "交換",
      whitepaper: "ホワイトペーパー",
      contributing: "貢献",
      forum: "フォーラム",
      serviceagreement: "利用規約",
      privacypolicy: "プライバシーポリシー",
      disclaimers: "免責事項",
      legal: "法的",
      contact: "お問い合わせ",
      email: "メール",
      phone: "電話",
      address: "住所",
      governance: "ガバナンス",
      mission: "ミッション",
      about: "会社概要",
      allrightsreserved: "全著作権所有",
      resources: "リソース",
      links: "リンク",
      accountinfo: "アカウント情報",
      admin: {
        exchangeSetup: "トークン交換レート設定"
      }
    },
    title: "FAIR エコシステム",
    logs: {
      contractLogs: "コントラクトログ",
      noData: "まだ操作記録がありません",
      table: {
        user: "アドレス",
        from: "送信元アドレス",
        eventName: "操作",
        amount: "数量",
        timestamp: "時間",
        status: "状態",
        transactionId: "トランザクションハッシュ",
        tokenAmount: "トークン数量",
        frAmount: "FR数量",
        fairAmount: "FAIR数量",
        value: "価値",
        to: "送信先アドレス",
        operator: "オペレーター"
      },
      eventNames: {
        Staked: "ステーク",
        Unstaked: "アンステーク",
        RewardClaimed: "報酬を受け取る",
        Withdrawn: "引き出し",
        UnstakeRequested: "アンステークを要求",
        Paused: "一時停止",
        Unpaused: "再開",
        ContributorRewardMinted: "貢献者報酬ミント",
        Burnt: "バーン",
        Transfer: "転送",
        Mint: "ミント",
        Burn: "バーン",
        Reward: "報酬",
        TokenExchanged: "トークン交換"
      },
      status: {
        success: "成功",
        pending: "処理中",
        failed: "失敗"
      }
    },
    admin: {
      title: "管理ツール",
      exchange: {
        title: "トークン交換レート設定"
      }
    }
  },
  ru: {
    network: {
      warnning: "Текущая среда - тестовая сеть, все транзакции действительны только в тестовой сети и не повлияют на основную сеть.",
      disconnect: "Кошелек отключен",
      connect: {
        error: "Ошибка подключения кошелька"
      }
    },
    navigation: {
      doc: "Документация",
      staking: "Стейкинг",
      burn: "Сжигание",
      exchange: "Обмен",
      whitepaper: "Белая книга",
      contributing: "Участие",
      forum: "Форум",
      serviceagreement: "Соглашение о предоставлении услуг",
      privacypolicy: "Политика конфиденциальности",
      disclaimers: "Отказ от ответственности",
      legal: "Юридическое",
      contact: "Контакты",
      email: "Электронная почта",
      phone: "Телефон",
      address: "Адрес",
      governance: "Управление",
      mission: "Миссия",
      about: "О нас",
      allrightsreserved: "Все права защищены",
      resources: "Ресурсы",
      links: "Ссылки",
      accountinfo: "Информация о счете",
      admin: {
        exchangeSetup: "Настройка курса обмена токенов"
      }
    },
    title: "Экосистема FAIR",
    logs: {
      contractLogs: "Логи контракта",
      noData: "Нет записей о операциях",
      table: {
        user: "Адрес",
        from: "Отправитель",
        eventName: "Операция",
        amount: "Количество",
        timestamp: "Время",
        status: "Статус",
        transactionId: "Хэш транзакции",
        tokenAmount: "Количество токенов",
        frAmount: "Количество FR",
        fairAmount: "Количество FAIR",
        value: "Значение",
        to: "Получатель",
        operator: "Оператор"
      },
      eventNames: {
        Staked: "Стейкинг",
        Unstaked: "Анстейкинг",
        RewardClaimed: "Получить награду",
        Withdrawn: "Вывести",
        UnstakeRequested: "Запрос на анстейкинг",
        Paused: "Приостановлено",
        Unpaused: "Возобновлено",
        ContributorRewardMinted: "Минт награды за вклад",
        Burnt: "Сожжено",
        Transfer: "Перевод",
        Mint: "Минт",
        Burn: "Сжигание",
        Reward: "Награда",
        TokenExchanged: "Обмен токенов"
      },
      status: {
        success: "Успешно",
        pending: "В процессе",
        failed: "Не выполнено"
      }
    },
    admin: {
      title: "Административные инструменты",
      exchange: {
        title: "Настройка курса обмена токенов"
      }
    }
  },
  th: {
    network: {
      warnning: "สภาพแวดล้อมปัจจุบันเป็น testnet ทุกธุรกรรมมีผลใน testnet เท่านั้น และจะไม่ส่งผลต่อ mainnet",
      disconnect: "วอลเล็ตถูกตัดการเชื่อมต่อ",
      connect: {
        error: "การเชื่อมต่อวอลเล็ตล้มเหลว"
      }
    },
    navigation: {
      doc: "เอกสาร",
      staking: "Staking",
      burn: "Burn",
      exchange: "การแลกเปลี่ยน",
      whitepaper: "Whitepaper",
      contributing: "การมีส่วนร่วม",
      forum: "ฟอรั่ม",
      serviceagreement: "ข้อตกลงการให้บริการ",
      privacypolicy: "นโยบายความเป็นส่วนตัว",
      disclaimers: "การปฏิเสธความรับผิดชอบ",
      legal: "กฎหมาย",
      contact: "ติดต่อเรา",
      email: "อีเมล",
      phone: "โทรศัพท์",
      address: "ที่อยู่",
      governance: "การปกครอง",
      mission: "พันธกิจ",
      about: "เกี่ยวกับเรา",
      allrightsreserved: "สงวนลิขสิทธิ์ทั้งหมด",
      resources: "ทรัพยากร",
      links: "ลิงก์",
      accountinfo: "ข้อมูลบัญชี",
      admin: {
        exchangeSetup: "ตั้งค่าอัตราตกลางการแลกเปลี่ยนตัวเงิน",
      }
    },
    title: "ระบบ FAIR",
    logs: {
      contractLogs: "บันทึกสัญญา",
      noData: "ยังไม่มีบันทึกการดำเนินการ",
      table: {
        user: "ที่อยู่",
        from: "ที่อยู่ต้นทาง",
        eventName: "การดำเนินการ",
        amount: "จำนวน",
        timestamp: "เวลา",
        status: "สถานะ",
        transactionId: "ฮอชธุรกรรม",
        tokenAmount: "จำนวนตัวเงิน",
        frAmount: "จำนวน FR",
        fairAmount: "จำนวน FAIR",
        value: "มูลค่า",
        to: "ที่อยู่ปลายทาง",
        operator: "ตัวดำเนินการ"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "รับรางวัล",
        Withdrawn: "ถอน",
        UnstakeRequested: "ขอ Unstake",
        Paused: "หยุดชั่วคราว",
        Unpaused: "ต่อเนื่อง",
        ContributorRewardMinted: "รางวัลสำหรับผู้มีส่วนร่วม",
        Burnt: "ถูกเผา",
        Transfer: "โอน",
        Mint: "Mint",
        Burn: "Burn",
        Reward: "รางวัล",
        TokenExchanged: "ตัวเงินที่แลกเปลี่ยน"
      },
      status: {
        success: "สำเร็จ",
        pending: "กำลังดำเนินการ",
        failed: "ล้มเหลว"
      }
    },
    admin: {
      title: "เครื่องมือการจัดการ",
      exchange: {
        title: "ตั้งค่าอัตราตกลางการแลกเปลี่ยนตัวเงิน"
      }
    }
  },
  vi: {
    network: {
      warnning: "Môi trường hiện tại là mạng thử nghiệm, tất cả các giao dịch chỉ có hiệu lực trên mạng thử nghiệm và sẽ không ảnh hưởng đến mạng chính.",
      disconnect: "Ví đã ngắt kết nối",
      connect: {
        error: "Kết nối ví thất bại"
      }
    },
    navigation: {
      doc: "Tài liệu",
      staking: "Staking",
      burn: "Đốt",
      exchange: "Đổi",
      whitepaper: "Tài liệu",
      contributing: "Đóng góp",
      forum: "Diễn đàn",
      serviceagreement: "Thỏa thuận dịch vụ",
      privacypolicy: "Chính sách bảo mật",
      disclaimers: "Từ chối trách nhiệm",
      legal: "Luật pháp",
      contact: "Liên hệ",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      governance: "Chính trị",
      mission: "Nhiệm vụ",
      about: "Giới thiệu",
      allrightsreserved: "Tất cả quyền hạn được bảo lưu",
      resources: "Nguồn tài nguyên",
      links: "Liên kết",
      accountinfo: "Thông tin tài khoản",
      admin: {
        exchangeSetup: "Cài đặt tỷ giá đổi token"
      }
    },
    title: "Hệ sinh thái FAIR",
    logs: {
      contractLogs: "Nhật ký hợp đồng",
      noData: "Không có hồ sơ hoạt động nào",
      table: {
        user: "Địa chỉ",
        from: "Địa chỉ nguồn",
        eventName: "Hoạt động",
        amount: "Số lượng",
        timestamp: "Thời gian",
        status: "Trạng thái",
        transactionId: "Hash giao dịch",
        tokenAmount: "Số lượng token",
        frAmount: "Số lượng FR",
        fairAmount: "Số lượng FAIR",
        value: "Giá trị",
        to: "Địa chỉ đích",
        operator: "Tác nhân"
      },
      eventNames: {
        Staked: "Đặt cược",
        Unstaked: "Hủy đặt cược",
        RewardClaimed: "Nhận thưởng",
        Withdrawn: "Rút ra",
        UnstakeRequested: "Yêu cầu hủy đặt cược",
        Paused: "Tạm dừng",
        Unpaused: "Tiếp tục",
        ContributorRewardMinted: "Tạo token thưởng cho người đóng góp",
        Burnt: "Đã đốt",
        Transfer: "Chuyển tiền",
        Mint: "Tạo token",
        Burn: "Đốt",
        Reward: "Thưởng",
        TokenExchanged: "Đã đổi token"
      },
      status: {
        success: "Thành công",
        pending: "Đang xử lý",
        failed: "Không thành công"
      }
    },
    admin: {
      title: "Công cụ quản lý",
      exchange: {
        title: "Cài đặt tỷ giá đổi token"
      }
    }
  },
  ko: {
    network: {
      warnning: "현재 환경은 테스트넷입니다. 모든 거래는 테스트넷에서만 유효하며 메인넷에 영향을 미치지 않습니다.",
      disconnect: "지갑 연결이 끊어졌습니다",
      connect: {
        error: "지갑 연결에 실패했습니다"
      }
    },
    navigation: {
      doc: "문서",
      staking: "스테이킹",
      burn: "소각",
      exchange: "교환",
      whitepaper: "화이트페이퍼",
      contributing: "기여",
      forum: "포럼",
      serviceagreement: "이용약관",
      privacypolicy: "개인정보 정책",
      disclaimers: "免責声明",
      legal: "법적",
      contact: "연락처",
      email: "이메일",
      phone: "전화",
      address: "주소",
      governance: "거버넌스",
      mission: "미션",
      about: "회사 소개",
      allrightsreserved: "모든 권리 보유",
      resources: "자원",
      links: "링크",
      accountinfo: "계정 정보",
      admin: {
        exchangeSetup: "토큰 교환 비율 설정"
      }
    },
    title: "FAIR 생태계",
    logs: {
      contractLogs: "계약 로그",
      noData: "아직 작업 기록이 없습니다",
      table: {
        user: "주소",
        from: "출발 주소",
        eventName: "작업",
        amount: "수량",
        timestamp: "시간",
        status: "상태",
        transactionId: "거래 해시",
        tokenAmount: "토큰 수량",
        frAmount: "FR 수량",
        fairAmount: "FAIR 수량",
        value: "값",
        to: "받는 주소",
        operator: "운영자"
      },
      eventNames: {
        Staked: "스테이크",
        Unstaked: "언스테이크",
        RewardClaimed: "보상 받기",
        Withdrawn: "출금",
        UnstakeRequested: "언스테이크 요청",
        Paused: "일시 정지",
        Unpaused: "계속",
        ContributorRewardMinted: "기여자 보상 마인트",
        Burnt: "소각",
        Transfer: "이체",
        Mint: "마인트",
        Burn: "소각",
        Reward: "보상",
        TokenExchanged: "토큰 교환"
      },
      status: {
        success: "성공",
        pending: "처리 중",
        failed: "실패"
      }
    },
    admin: {
      title: "관리 도구",
      exchange: {
        title: "토큰 교환 비율 설정"
      }
    }
  }
};

// 生成翻译文件的函数
function generateTranslationFiles() {
  const appDir = path.join(__dirname, '');
  const langsFilePath = path.join(appDir, 'i18n', 'langs.json');
  
  // 读取语言列表
  const langsData = JSON.parse(fs.readFileSync(langsFilePath, 'utf8'));
  const languages = langsData.Langs;
  
  // 处理每个语言
  languages.forEach(lang => {
    const langName = lang.Name;
    const langDisplayName = lang.DisplayName;
    
    console.log(`处理语言: ${langName} (${langDisplayName})`);
    
    // 只处理非中文语言
    if (langName !== 'zh') {
      // 处理根目录 i18n
      const rootSrcFilePath = path.join(appDir, 'i18n', 'zh.json');
      const rootDestFilePath = path.join(appDir, 'i18n', `${langName}.json`);
      
      // 获取该语言的翻译
      const langTranslations = translations[langName];
      
      // 如果有翻译数据，就进行翻译
      if (langTranslations) {
        // 读取中文源文件
        const zhContent = JSON.parse(fs.readFileSync(rootSrcFilePath, 'utf8'));
        
        // 翻译文件
        const translatedContent = translateObject(zhContent, langName);
        
        // 保存翻译后的文件
        fs.writeFileSync(rootDestFilePath, JSON.stringify(translatedContent, null, 2), 'utf8');
        console.log(`  ✓ 已生成根 i18n 文件: ${rootDestFilePath}`);
      } else {
        console.log(`  ✗ 缺少语言翻译: ${langName}`);
      }
      
      // 处理各个模块
      const modules = [
        {
          name: 'admin-exchange',
          srcPath: path.join(appDir, 'admin-exchange', 'i18n', 'zh.json'),
          destDir: path.join(appDir, 'admin-exchange', 'i18n'),
          translationKey: 'admin_exchange'
        },
        {
          name: 'home',
          srcPath: path.join(appDir, 'home', 'i18n', 'zh.json'),
          destDir: path.join(appDir, 'home', 'i18n'),
          translationKey: 'home'
        },
        {
          name: 'home-exchange',
          srcPath: path.join(appDir, 'home-exchange', 'i18n', 'zh.json'),
          destDir: path.join(appDir, 'home-exchange', 'i18n'),
          translationKey: 'home_exchange'
        },
        {
          name: 'home-staking',
          srcPath: path.join(appDir, 'home-staking', 'i18n', 'zh.json'),
          destDir: path.join(appDir, 'home-staking', 'i18n'),
          translationKey: 'home_staking'
        },
        {
          name: 'home-user',
          srcPath: path.join(appDir, 'home-user', 'i18n', 'zh.json'),
          destDir: path.join(appDir, 'home-user', 'i18n'),
          translationKey: 'home_user'
        }
      ];
      
      modules.forEach(module => {
        // 检查源文件是否存在
        if (fs.existsSync(module.srcPath)) {
          const destFilePath = path.join(module.destDir, `${langName}.json`);
          
          // 读取模块的中文源文件
          const zhModuleContent = JSON.parse(fs.readFileSync(module.srcPath, 'utf8'));
          
          // 翻译模块内容
          const translatedModuleContent = translateObject(zhModuleContent, langName, module.translationKey);
          
          // 保存翻译后的文件
          fs.writeFileSync(destFilePath, JSON.stringify(translatedModuleContent, null, 2), 'utf8');
          console.log(`  ✓ 已生成 ${module.name} 模块: ${destFilePath}`);
        }
      });
    }
  });
  
  console.log('\n所有翻译文件生成完成！');
}

// 递归翻译对象的函数
function translateObject(obj, targetLang, moduleKey = null) {
  const translated = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      translated[key] = translateObject(value, targetLang, moduleKey);
    } else if (typeof value === 'string') {
      // 根据模块和键查找翻译
      if (moduleKey && translations[targetLang] && translations[targetLang][moduleKey]) {
        let current = translations[targetLang][moduleKey];
        // 创建键路径
        const keyPath = [moduleKey, ...key.split('.')];
        let found = false;
        
        // 尝试查找嵌套翻译
        for (let i = 1; i < keyPath.length; i++) {
          if (current[keyPath[i]]) {
            current = current[keyPath[i]];
            if (i === keyPath.length - 1) {
              translated[key] = current;
              found = true;
            }
          } else {
            break;
          }
        }
        
        // 如果没有找到嵌套翻译，尝试直接查找当前键
        if (!found) {
          let currentModule = translations[targetLang][moduleKey];
          
          const findInObj = (obj, searchKey) => {
            if (obj.hasOwnProperty(searchKey)) {
              translated[key] = obj[searchKey];
              return true;
            }
            for (const [k, v] of Object.entries(obj)) {
              if (typeof v === 'object' && v !== null && findInObj(v, searchKey)) {
                return true;
              }
            }
            return false;
          };
          
          if (findInObj(currentModule, key)) {
            // 找到翻译了
          } else {
            translated[key] = value;
          }
        }
      } else if (translations[targetLang]) {
        let current = translations[targetLang];
        // 尝试查找根翻译
        const findInRoot = (obj, searchKey) => {
          if (obj.hasOwnProperty(searchKey)) {
            return obj[searchKey];
          }
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'object' && v !== null) {
              const found = findInRoot(v, searchKey);
              if (found) return found;
            }
          }
          return null;
        };
        
        const translation = findInRoot(current, key);
        
        if (translation) {
          translated[key] = translation;
        } else {
          // 如果没有找到翻译，尝试使用英语翻译
          if (targetLang !== 'en' && translations['en']) {
            const enTranslation = findInRoot(translations['en'], key);
            if (enTranslation) {
              translated[key] = enTranslation;
            } else {
              translated[key] = value; // 如果英语翻译也没有，保持中文
            }
          } else {
            translated[key] = value;
          }
        }
      } else {
        // 如果没有该语言的翻译，使用原文本
        translated[key] = value;
      }
    } else {
      translated[key] = value;
    }
  }
  
  return translated;
}

// 主函数
if (require.main === module) {
  console.log('开始生成翻译文件...');
  generateTranslationFiles();
}

module.exports = { generateTranslationFiles, translateObject };