const fs = require('fs');
const path = require('path');

// 定义需要翻译的语言
const languages = ['ar', 'es', 'hi', 'fr', 'ja', 'ru', 'th', 'vi', 'ko'];

// 定义所有翻译数据 - 包含根目录和所有子模块的完整翻译
const allTranslations = {
  // 阿拉伯语 (Arabic)
  ar: {
    network: {
      warnning: "البيئة الحالية هي شبكة اختبارية، وتكون جميع المعاملات صالحة فقط على الشبكة التجريبية ولا ستؤثر على الشبكة الرئيسية.",
      disconnect: "المحفظة مفصولة",
      connect: { error: "فشل الاتصال بالمحفظة" }
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
      admin: { exchangeSetup: "إعداد سعر التبادل للعملات" }
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
        status: { success: "ناجح", pending: "قيد المعالجة", failed: "فشل" },
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
        ContributorRewardMinted: "توليد مكافأة للمساهم",
        Burnt: "محترق",
        Transfer: "تحويل",
        Mint: "توليد",
        Burn: "حريق",
        Reward: "مكافأة",
        TokenExchanged: "تبادل العملة"
      },
      status: { success: "ناجح", pending: "قيد المعالجة", failed: "فشل" }
    },
    admin: { title: "نظام FAIR", exchange: { title: "نظام FAIR" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "تبادل العملات",
          amount: "كمية الحريق FR",
          placeholder: "أدخل كمية الحريق",
          token: "عملة المكافأة",
          token_placeholder: "الرجاء اختيار عملة المكافأة",
          button: "حرق FR",
          frBalance: "رصيد عملة FR"
        }
      },
      logs: {
        burnLogs: "سجلات الحريق"
      },
      exchange: {
        notOpen: "التبادل غير مفتوح",
        end: "انتهى",
        startTime: "وقت البدء",
        endTime: "وقت الانتهاء",
        remainingAmount: "المتبقي"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "FAIR المرهن / رصيد FAIR",
        earnedFrBalance: "FR المكتسبة / رصيد FR",
        unstakeRequestAmount: "كمية طلب إلغاء الرهان",
        unstakeCountdown: "عداد تنازلي طلب إلغاء الرهان",
        stakeAmountFair: "كمية المرهن (FAIR)",
        unstakeAmountFair: "كمية إلغاء الرهان (FAIR)",
        unstakeWaitPeriod: "فترة انتظار إلغاء الرهان"
      },
      buttons: {
        stake: "رهن",
        claim: "استلام",
        withdraw: "سحب",
        requestUnstake: "طلب إلغاء الرهان",
        cancel: "إلغاء",
        confirmStake: "تأكيد الرهان",
        confirmUnstake: "تأكيد طلب إلغاء الرهان",
        confirmClaim: "تأكيد الاستلام",
        refreshStats: "تحديث الإحصائيات",
        refreshLogs: "تحديث السجلات"
      },
      modals: {
        stakeFair: "رهن FAIR",
        requestUnstake: "طلب إلغاء الرهان",
        claimRewards: "استلام المكافآت",
        confirmClaim: "تأكيد الاستلام"
      },
      unstakeWaitDays: {
        "30days": "30 يوم",
        "15days": "15 يوم",
        "60days": "60 يوم"
      },
      placeholders: {
        enterStakeAmount: "الرجاء إدخال مبلغ الرهان",
        enterUnstakeAmount: "الرجاء إدخال مبلغ إلغاء الرهان"
      },
      title: {
        stakeAndUnstake: "الرهان و إلغاء الرهان",
        stakeOperations: "عمليات الرهان",
        unstakeOperations: "عمليات إلغاء الرهان",
        operationsHistory: "تاريخ العمليات"
      }
    }
  },
  // 西班牙语 (Spanish)
  es: {
    network: {
      warnning: "El entorno actual es testnet, todas las transacciones solo son válidas en testnet y no afectarán el mainnet.",
      disconnect: "Billetera desconectada",
      connect: { error: "Error en la conexión de billetera" }
    },
    navigation: {
      doc: "Documentos",
      staking: "Staking",
      burn: "Quemar",
      exchange: "Intercambio",
      whitepaper: "Whitepaper",
      contributing: "Contribuir",
      forum: "Foro",
      serviceagreement: "Acuerdo de servicio",
      privacypolicy: "Política de privacidad",
      disclaimers: "Renuncias",
      legal: "Legal",
      contact: "Contacto",
      email: "Correo electrónico",
      phone: "Teléfono",
      address: "Dirección",
      governance: "Gobernanza",
      mission: "Misión",
      about: "Acerca de nosotros",
      allrightsreserved: "Todos los derechos reservados",
      resources: "Recursos",
      links: "Enlaces",
      accountinfo: "Información de cuenta",
      admin: { exchangeSetup: "Configurar tipo de cambio de token" }
    },
    title: "Ecosistema FAIR",
    logs: {
      contractLogs: "Logs de contrato",
      noData: "No hay registros de operaciones aún",
      table: {
        user: "Dirección",
        from: "Dirección de origen",
        eventName: "Operación",
        amount: "Cantidad",
        timestamp: "Hora",
        status: { success: "Éxito", pending: "Procesando", failed: "Fallido" },
        transactionId: "Hash de transacción",
        tokenAmount: "Cantidad de token",
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
        Withdrawn: "Retirar",
        UnstakeRequested: "Solicitar unstake",
        Paused: "Pausado",
        Unpaused: "Reanudado",
        ContributorRewardMinted: "Minteo de recompensa para contribuyente",
        Burnt: "Quemado",
        Transfer: "Transferir",
        Mint: "Mintear",
        Burn: "Quemar",
        Reward: "Recompensa",
        TokenExchanged: "Token intercambiado"
      },
      status: { success: "Éxito", pending: "Procesando", failed: "Fallido" }
    },
    admin: { title: "Ecosistema FAIR", exchange: { title: "Ecosistema FAIR" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "Intercambio de tokens",
          amount: "Cantidad de FR quemados",
          placeholder: "Ingrese la cantidad a quemar",
          token: "Token de recompensa",
          token_placeholder: "Por favor seleccione el token de recompensa",
          button: "Quemar FR",
          frBalance: "Saldo de token FR"
        }
      },
      logs: {
        burnLogs: "Logs de quema"
      },
      exchange: {
        notOpen: "Intercambio no disponible",
        end: "Finalizado",
        startTime: "Hora de inicio",
        endTime: "Hora de finalización",
        remainingAmount: "Restante"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "FAIR apostado / Saldo FAIR",
        earnedFrBalance: "FR ganado / Saldo FR",
        unstakeRequestAmount: "Cantidad de solicitud de unstake",
        unstakeCountdown: "Cuenta regresiva de unstake",
        stakeAmountFair: "Cantidad apostada (FAIR)",
        unstakeAmountFair: "Cantidad de unstake (FAIR)",
        unstakeWaitPeriod: "Periodo de espera de unstake"
      },
      buttons: {
        stake: "Apostar",
        claim: "Reclamar",
        withdraw: "Retirar",
        requestUnstake: "Solicitar unstake",
        cancel: "Cancelar",
        confirmStake: "Confirmar apostado",
        confirmUnstake: "Confirmar solicitud de unstake",
        confirmClaim: "Confirmar reclamación",
        refreshStats: "Actualizar estadísticas",
        refreshLogs: "Actualizar logs"
      },
      modals: {
        stakeFair: "Apostar FAIR",
        requestUnstake: "Solicitar unstake",
        claimRewards: "Reclamar recompensas",
        confirmClaim: "Confirmar reclamación"
      },
      unstakeWaitDays: {
        "30days": "30 días",
        "15days": "15 días",
        "60days": "60 días"
      },
      placeholders: {
        enterStakeAmount: "Por favor ingrese la cantidad a apostar",
        enterUnstakeAmount: "Por favor ingrese la cantidad de unstake"
      },
      title: {
        stakeAndUnstake: "Apostar & Unstake",
        stakeOperations: "Operaciones de apostado",
        unstakeOperations: "Operaciones de unstake",
        operationsHistory: "Historial de operaciones"
      }
    }
  },
  // 印地语 (Hindi)
  hi: {
    network: {
      warnning: "वर्तमान वातावरण टेस्टनेट है, सभी लेनदेन केवल टेस्टनेट पर वैध हैं और मेननेट को प्रभावित नहीं करेंगे।",
      disconnect: "वॉलेट डिस्कनेक्ट हुई",
      connect: { error: "वॉलेट कनेक्शन विफल हुई" }
    },
    navigation: {
      doc: "दस्तावेज",
      staking: "स्टेकिंग",
      burn: "बर्न",
      exchange: "एक्सचेंज",
      whitepaper: "व्हाइटपेपर",
      contributing: "योगदान करना",
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
      admin: { exchangeSetup: "टोकन विनिमय दर सेटअप" }
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
        status: { success: "सफल", pending: "प्रोसेसिंग", failed: "विफल" },
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
      status: { success: "सफल", pending: "प्रोसेसिंग", failed: "विफल" }
    },
    admin: { title: "फेयर इकोसिस्टम", exchange: { title: "फेयर इकोसिस्टम" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "टोकन विनिमय",
          amount: "बर्न की गई FR की मात्रा",
          placeholder: "बर्न की गई मात्रा दर्ज करें",
          token: "पुरस्कार टोकन",
          token_placeholder: "कृपया पुरस्कार टोकन चुनें",
          button: "FR बर्न करें",
          frBalance: "FR टोकन का बैलेंस"
        }
      },
      logs: {
        burnLogs: "बर्न लॉग"
      },
      exchange: {
        notOpen: "विनिमय खुला नहीं है",
        end: "समाप्त हुआ",
        startTime: "शुरू होने का समय",
        endTime: "समाप्त होने का समय",
        remainingAmount: "शेष मात्रा"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "स्टेक किया गया FAIR / FAIR बैलेंस",
        earnedFrBalance: "अर्जित FR / FR बैलेंस",
        unstakeRequestAmount: "अनस्टेक अनुरोध मात्रा",
        unstakeCountdown: "अनस्टेक काउंटडाउन",
        stakeAmountFair: "स्टेक की गई मात्रा (FAIR)",
        unstakeAmountFair: "अनस्टेक की गई मात्रा (FAIR)",
        unstakeWaitPeriod: "अनस्टेक प्रतीक्षा अवधि"
      },
      buttons: {
        stake: "स्टेक",
        claim: "दावा करें",
        withdraw: "निकालें",
        requestUnstake: "अनस्टेक अनुरोध करें",
        cancel: "रद्द करें",
        confirmStake: "स्टेक की पुष्टि करें",
        confirmUnstake: "अनस्टेक अनुरोध पुष्टि करें",
        confirmClaim: "दावा पुष्टि करें",
        refreshStats: "आंकड़े ताज़ा करें",
        refreshLogs: "लॉग ताज़ा करें"
      },
      modals: {
        stakeFair: "FAIR स्टेक करें",
        requestUnstake: "अनस्टेक अनुरोध करें",
        claimRewards: "पुरस्कार दावा करें",
        confirmClaim: "दावा पुष्टि करें"
      },
      unstakeWaitDays: {
        "30days": "30 दिन",
        "15days": "15 दिन",
        "60days": "60 दिन"
      },
      placeholders: {
        enterStakeAmount: "कृपया स्टेक मात्रा दर्ज करें",
        enterUnstakeAmount: "कृपया अनस्टेक मात्रा दर्ज करें"
      },
      title: {
        stakeAndUnstake: "स्टेक और अनस्टेक",
        stakeOperations: "स्टेक ऑपरेशन",
        unstakeOperations: "अनस्टेक ऑपरेशन",
        operationsHistory: "ऑपरेशन इतिहास"
      }
    }
  },
  // 法语 (French)
  fr: {
    network: {
      warnning: "L'environnement actuel est un testnet, toutes les transactions ne sont valides que sur le testnet et n'affecteront pas le mainnet.",
      disconnect: "Wallet déconnecté",
      connect: { error: "Échec de la connexion du wallet" }
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
      admin: { exchangeSetup: "Configuration du taux d'échange des tokens" }
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
        status: { success: "Succès", pending: "En cours", failed: "Échec" },
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
      status: { success: "Succès", pending: "En cours", failed: "Échec" }
    },
    admin: { title: "Écosystème FAIR", exchange: { title: "Écosystème FAIR" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "Échange de tokens",
          amount: "Quantité de FR brûlés",
          placeholder: "Entrez la quantité à brûler",
          token: "Token de récompense",
          token_placeholder: "Veuillez sélectionner le token de récompense",
          button: "Brûler FR",
          frBalance: "Solde du token FR"
        }
      },
      logs: {
        burnLogs: "Journaux de brûlage"
      },
      exchange: {
        notOpen: "Échange non disponible",
        end: "Terminé",
        startTime: "Heure de début",
        endTime: "Heure de fin",
        remainingAmount: "Restant"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "FAIR staké / Solde FAIR",
        earnedFrBalance: "FR gagné / Solde FR",
        unstakeRequestAmount: "Quantité de demande d'unstake",
        unstakeCountdown: "Compte à rebours d'unstake",
        stakeAmountFair: "Quantité stakée (FAIR)",
        unstakeAmountFair: "Quantité d'unstake (FAIR)",
        unstakeWaitPeriod: "Période d'attente d'unstake"
      },
      buttons: {
        stake: "Staker",
        claim: "Réclamer",
        withdraw: "Retirer",
        requestUnstake: "Demander un unstake",
        cancel: "Annuler",
        confirmStake: "Confirmer le staking",
        confirmUnstake: "Confirmer la demande d'unstake",
        confirmClaim: "Confirmer la réclamation",
        refreshStats: "Actualiser les statistiques",
        refreshLogs: "Actualiser les journaux"
      },
      modals: {
        stakeFair: "Staker FAIR",
        requestUnstake: "Demander un unstake",
        claimRewards: "Réclamer les récompenses",
        confirmClaim: "Confirmer la réclamation"
      },
      unstakeWaitDays: {
        "30days": "30 jours",
        "15days": "15 jours",
        "60days": "60 jours"
      },
      placeholders: {
        enterStakeAmount: "Veuillez entrer la quantité à staker",
        enterUnstakeAmount: "Veuillez entrer la quantité d'unstake"
      },
      title: {
        stakeAndUnstake: "Staking & Unstake",
        stakeOperations: "Opérations de staking",
        unstakeOperations: "Opérations d'unstake",
        operationsHistory: "Historique des opérations"
      }
    }
  },
  // 日语 (Japanese)
  ja: {
    network: {
      warnning: "現在の環境はテストネットで、すべての取引はテストネットでのみ有効であり、メインネットには影響しません。",
      disconnect: "ウォレットが切断されました",
      connect: { error: "ウォレット接続に失敗しました" }
    },
    navigation: {
      doc: "ドキュメント",
      staking: "ステーキング",
      burn: "バーン",
      exchange: "交換",
      whitepaper: "ホワイトペーパー",
      contributing: "貢献",
      forum: "フォーラム",
      serviceagreement: "サービス契約",
      privacypolicy: "プライバシーポリシー",
      disclaimers: "免責事項",
      legal: "法的",
      contact: "お問い合わせ",
      email: "メール",
      phone: "電話",
      address: "住所",
      governance: "ガバナンス",
      mission: "ミッション",
      about: "私たちについて",
      allrightsreserved: "全著作権所有",
      resources: "リソース",
      links: "リンク",
      accountinfo: "アカウント情報",
      admin: { exchangeSetup: "トークン交換レート設定" }
    },
    title: "FAIR エコシステム",
    logs: {
      contractLogs: "コントラクトログ",
      noData: "まだ操作記録はありません",
      table: {
        user: "アドレス",
        from: "送信元アドレス",
        eventName: "操作",
        amount: "数量",
        timestamp: "時間",
        status: { success: "成功", pending: "処理中", failed: "失敗" },
        transactionId: "トランザクションハッシュ",
        tokenAmount: "トークン数量",
        frAmount: "FR数量",
        fairAmount: "FAIR数量",
        value: "値",
        to: "宛先アドレス",
        operator: "オペレーター"
      },
      eventNames: {
        Staked: "ステーク",
        Unstaked: "アンステーク",
        RewardClaimed: "報酬を請求",
        Withdrawn: "引き出し",
        UnstakeRequested: "アンステーク要求",
        Paused: "一時停止",
        Unpaused: "再開",
        ContributorRewardMinted: "貢献者報酬をミント",
        Burnt: "バーン",
        Transfer: "転送",
        Mint: "ミント",
        Burn: "バーン",
        Reward: "報酬",
        TokenExchanged: "トークン交換"
      },
      status: { success: "成功", pending: "処理中", failed: "失敗" }
    },
    admin: { title: "FAIR エコシステム", exchange: { title: "FAIR エコシステム" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "トークン交換",
          amount: "バーンされたFRの数量",
          placeholder: "バーン数量を入力してください",
          token: "報酬トークン",
          token_placeholder: "報酬トークンを選択してください",
          button: "FRをバーン",
          frBalance: "FRトークン残高"
        }
      },
      logs: {
        burnLogs: "バーンログ"
      },
      exchange: {
        notOpen: "交換は開放されていません",
        end: "終了",
        startTime: "開始時間",
        endTime: "終了時間",
        remainingAmount: "残り"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "ステークされた FAIR / FAIR 残高",
        earnedFrBalance: "獲得 FR / FR 残高",
        unstakeRequestAmount: "アンステーク要求数量",
        unstakeCountdown: "アンステークカウントダウン",
        stakeAmountFair: "ステーク数量 (FAIR)",
        unstakeAmountFair: "アンステーク数量 (FAIR)",
        unstakeWaitPeriod: "アンステーク待機期間"
      },
      buttons: {
        stake: "ステーク",
        claim: "請求",
        withdraw: "引き出し",
        requestUnstake: "アンステーク要求",
        cancel: "キャンセル",
        confirmStake: "ステーク確認",
        confirmUnstake: "アンステーク要求確認",
        confirmClaim: "請求確認",
        refreshStats: "統計を更新",
        refreshLogs: "ログを更新"
      },
      modals: {
        stakeFair: "FAIR をステーク",
        requestUnstake: "アンステーク要求",
        claimRewards: "報酬を請求",
        confirmClaim: "請求確認"
      },
      unstakeWaitDays: {
        "30days": "30日",
        "15days": "15日",
        "60days": "60日"
      },
      placeholders: {
        enterStakeAmount: "ステーク数量を入力してください",
        enterUnstakeAmount: "アンステーク数量を入力してください"
      },
      title: {
        stakeAndUnstake: "ステーク & アンステーク",
        stakeOperations: "ステーク操作",
        unstakeOperations: "アンステーク操作",
        operationsHistory: "操作履歴"
      }
    }
  },
  // 俄语 (Russian)
  ru: {
    network: {
      warnning: "Текущее окружение - тестнет, все транзакции действительны только в тестнете и не повлияют на мэйннет.",
      disconnect: "Кошелек отключен",
      connect: { error: "Не удалось подключить кошелек" }
    },
    navigation: {
      doc: "Документация",
      staking: "Стейкинг",
      burn: "Сжигание",
      exchange: "Обмен",
      whitepaper: "Вайтпейпер",
      contributing: "Участие",
      forum: "Форум",
      serviceagreement: "Соглашение об оказании услуг",
      privacypolicy: "Политика конфиденциальности",
      disclaimers: "Отказ от ответственности",
      legal: "Юридическое",
      contact: "Контакты",
      email: "Эл. почта",
      phone: "Телефон",
      address: "Адрес",
      governance: "Гovernance",
      mission: "Миссия",
      about: "О нас",
      allrightsreserved: "Все права защищены",
      resources: "Ресурсы",
      links: "Ссылки",
      accountinfo: "Информация о счете",
      admin: { exchangeSetup: "Настройка курса обмена токенов" }
    },
    title: "FAIR экосистема",
    logs: {
      contractLogs: "Логи контракта",
      noData: "Нет операционных записей еще",
      table: {
        user: "Адрес",
        from: "Откуда",
        eventName: "Операция",
        amount: "Количество",
        timestamp: "Время",
        status: { success: "Успешно", pending: "В обработке", failed: "Неудачно" },
        transactionId: "Хэш транзакции",
        tokenAmount: "Количество токенов",
        frAmount: "Количество FR",
        fairAmount: "Количество FAIR",
        value: "Значение",
        to: "Куда",
        operator: "Оператор"
      },
      eventNames: {
        Staked: "Стейк",
        Unstaked: "Анстейк",
        RewardClaimed: "Получить награду",
        Withdrawn: "Вывести",
        UnstakeRequested: "Запрос на анстейк",
        Paused: "Приостановлено",
        Unpaused: "Продолжено",
        ContributorRewardMinted: "Награда за участие",
        Burnt: "Сожгли",
        Transfer: "Перевести",
        Mint: "Минт",
        Burn: "Сжечь",
        Reward: "Награда",
        TokenExchanged: "Обмен токенов"
      },
      status: { success: "Успешно", pending: "В обработке", failed: "Неудачно" }
    },
    admin: { title: "FAIR экосистема", exchange: { title: "FAIR экосистема" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "Обмен токенов",
          amount: "Количество сжженного FR",
          placeholder: "Введите количество для сжигания",
          token: "Награда токен",
          token_placeholder: "Пожалуйста, выберите токен награды",
          button: "Сжечь FR",
          frBalance: "Баланс FR токена"
        }
      },
      logs: {
        burnLogs: "Логи сжигания"
      },
      exchange: {
        notOpen: "Обмен не открыт",
        end: "Закончился",
        startTime: "Время начала",
        endTime: "Время окончания",
        remainingAmount: "Оставшееся"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "Стейкнутый FAIR / Баланс FAIR",
        earnedFrBalance: "Заработанный FR / Баланс FR",
        unstakeRequestAmount: "Количество запросов на анстейк",
        unstakeCountdown: "Обратный отсчет для анстейка",
        stakeAmountFair: "Количество стейка (FAIR)",
        unstakeAmountFair: "Количество анстейка (FAIR)",
        unstakeWaitPeriod: "Период ожидания анстейка"
      },
      buttons: {
        stake: "Стейк",
        claim: "Получить",
        withdraw: "Вывести",
        requestUnstake: "Запросить анстейк",
        cancel: "Отмена",
        confirmStake: "Подтвердить стейк",
        confirmUnstake: "Подтвердить запрос на анстейк",
        confirmClaim: "Подтвердить получение",
        refreshStats: "Обновить статистику",
        refreshLogs: "Обновить логи"
      },
      modals: {
        stakeFair: "Стейк FAIR",
        requestUnstake: "Запросить анстейк",
        claimRewards: "Получить награды",
        confirmClaim: "Подтвердить получение"
      },
      unstakeWaitDays: {
        "30days": "30 дней",
        "15days": "15 дней",
        "60days": "60 дней"
      },
      placeholders: {
        enterStakeAmount: "Пожалуйста, введите количество для стейка",
        enterUnstakeAmount: "Пожалуйста, введите количество для анстейка"
      },
      title: {
        stakeAndUnstake: "Стейк & Анстейк",
        stakeOperations: "Операции стейка",
        unstakeOperations: "Операции анстейка",
        operationsHistory: "История операций"
      }
    }
  },
  // 泰语 (Thai)
  th: {
    network: {
      warnning: "สภาพแวดล้อมปัจจุบันเป็น testnet ทุกธุรกรรมมีผลใน testnet เท่านั้น และจะไม่ส่งผลต่อ mainnet",
      disconnect: "วอลเล็ตถูกตัดการเชื่อมต่อ",
      connect: { error: "การเชื่อมต่อวอลเล็ตล้มเหลว" }
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
      admin: { exchangeSetup: "ตั้งค่าอัตราตกลางการแลกเปลี่ยนตัวเงิน" }
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
        status: { success: "สำเร็จ", pending: "กำลังดำเนินการ", failed: "ล้มเหลว" },
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
      status: { success: "สำเร็จ", pending: "กำลังดำเนินการ", failed: "ล้มเหลว" }
    },
    admin: { title: "ระบบ FAIR", exchange: { title: "ระบบ FAIR" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "การแลกเปลี่ยนตัวเงิน",
          amount: "จำนวน FR ที่ถูกเผา",
          placeholder: "กรุณาใส่จำนวนที่จะเผา",
          token: "ตัวเงินรางวัล",
          token_placeholder: "กรุณาเลือกตัวเงินรางวัล",
          button: "เผา FR",
          frBalance: "ยอดคงเหลือของ FR Token"
        }
      },
      logs: {
        burnLogs: "บันทึกการเผา"
      },
      exchange: {
        notOpen: "ยังไม่เปิดการแลกเปลี่ยน",
        end: "สิ้นสุด",
        startTime: "เวลาเริ่มต้น",
        endTime: "เวลาสิ้นสุด",
        remainingAmount: "คงเหลือ"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "FAIR ที่ถูก stake / เงิน FAIR",
        earnedFrBalance: "FR ที่ได้รับ / เงิน FR",
        unstakeRequestAmount: "จำนวนขอ Unstake",
        unstakeCountdown: "Countdown ขอ Unstake",
        stakeAmountFair: "จำนวน stake (FAIR)",
        unstakeAmountFair: "จำนวน Unstake (FAIR)",
        unstakeWaitPeriod: "ระยะเวลารอ Unstake"
      },
      buttons: {
        stake: "Stake",
        claim: "รับ",
        withdraw: "ถอน",
        requestUnstake: "ขอ Unstake",
        cancel: "ยกเลิก",
        confirmStake: "ยืนยัน Stake",
        confirmUnstake: "ยืนยันขอ Unstake",
        confirmClaim: "ยืนยันการรับ",
        refreshStats: "รีเฟรชสถิติ",
        refreshLogs: "รีเฟรชบันทึก"
      },
      modals: {
        stakeFair: "Stake FAIR",
        requestUnstake: "ขอ Unstake",
        claimRewards: "รับรางวัล",
        confirmClaim: "ยืนยันการรับ"
      },
      unstakeWaitDays: {
        "30days": "30 วัน",
        "15days": "15 วัน",
        "60days": "60 วัน"
      },
      placeholders: {
        enterStakeAmount: "กรุณาใส่จำนวน stake",
        enterUnstakeAmount: "กรุณาใส่จำนวน Unstake"
      },
      title: {
        stakeAndUnstake: "Stake & Unstake",
        stakeOperations: "ดำเนินการ Stake",
        unstakeOperations: "ดำเนินการ Unstake",
        operationsHistory: "ประวัติการดำเนินการ"
      }
    }
  },
  // 越南语 (Vietnamese)
  vi: {
    network: {
      warnning: "Môi trường hiện tại là testnet, tất cả các giao dịch chỉ hợp lệ trên testnet và sẽ không ảnh hưởng đến mainnet.",
      disconnect: "Ví đã ngắt kết nối",
      connect: { error: "Kết nối ví thất bại" }
    },
    navigation: {
      doc: "Tài liệu",
      staking: "Staking",
      burn: "Đốt",
      exchange: "Đổi",
      whitepaper: "Whitepaper",
      contributing: "Đóng góp",
      forum: "Diễn đàn",
      serviceagreement: "Thỏa thuận dịch vụ",
      privacypolicy: "Chính sách bảo mật",
      disclaimers: "Từ chối trách nhiệm",
      legal: "Pháp lý",
      contact: "Liên hệ",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      governance: "Quy định",
      mission: "Sứ mệnh",
      about: "Về chúng tôi",
      allrightsreserved: "Tất cả các quyền được bảo lưu",
      resources: "Tài nguyên",
      links: "Liên kết",
      accountinfo: "Thông tin tài khoản",
      admin: { exchangeSetup: "Cấu hình tỷ giá token" }
    },
    title: "Hệ sinh thái FAIR",
    logs: {
      contractLogs: "Nhật ký hợp đồng",
      noData: "Chưa có dữ liệu hoạt động",
      table: {
        user: "Địa chỉ",
        from: "Địa chỉ nguồn",
        eventName: "Hoạt động",
        amount: "Số lượng",
        timestamp: "Thời gian",
        status: { success: "Thành công", pending: "Đang xử lý", failed: "Thất bại" },
        transactionId: "Hash giao dịch",
        tokenAmount: "Số lượng token",
        frAmount: "Số lượng FR",
        fairAmount: "Số lượng FAIR",
        value: "Giá trị",
        to: "Địa chỉ nhận",
        operator: "Toàn quyền"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Yêu cầu thưởng",
        Withdrawn: "Rút tiền",
        UnstakeRequested: "Yêu cầu unstake",
        Paused: "Dừng lại",
        Unpaused: "Tiếp tục",
        ContributorRewardMinted: "Thu thưởng người đóng góp",
        Burnt: "Đã đốt",
        Transfer: "Chuyển",
        Mint: "Mint",
        Burn: "Đốt",
        Reward: "Thưởng",
        TokenExchanged: "Token được đổi"
      },
      status: { success: "Thành công", pending: "Đang xử lý", failed: "Thất bại" }
    },
    admin: { title: "Hệ sinh thái FAIR", exchange: { title: "Hệ sinh thái FAIR" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "Trao đổi token",
          amount: "Số lượng FR bị đốt",
          placeholder: "Nhập số lượng cần đốt",
          token: "Token thưởng",
          token_placeholder: "Vui lòng chọn token thưởng",
          button: "Đốt FR",
          frBalance: "Số dư token FR"
        }
      },
      logs: {
        burnLogs: "Nhật ký đốt"
      },
      exchange: {
        notOpen: "Chưa mở trao đổi",
        end: "Kết thúc",
        startTime: "Thời gian bắt đầu",
        endTime: "Thời gian kết thúc",
        remainingAmount: "Còn lại"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "FAIR đã stake / Số dư FAIR",
        earnedFrBalance: "FR kiếm được / Số dư FR",
        unstakeRequestAmount: "Số lượng yêu cầu unstake",
        unstakeCountdown: "Đếm ngược unstake",
        stakeAmountFair: "Số lượng stake (FAIR)",
        unstakeAmountFair: "Số lượng unstake (FAIR)",
        unstakeWaitPeriod: "Khoảng thời gian chờ unstake"
      },
      buttons: {
        stake: "Stake",
        claim: "Yêu cầu",
        withdraw: "Rút tiền",
        requestUnstake: "Yêu cầu unstake",
        cancel: "Hủy",
        confirmStake: "Xác nhận stake",
        confirmUnstake: "Xác nhận yêu cầu unstake",
        confirmClaim: "Xác nhận yêu cầu",
        refreshStats: "Làm mới thống kê",
        refreshLogs: "Làm mới nhật ký"
      },
      modals: {
        stakeFair: "Stake FAIR",
        requestUnstake: "Yêu cầu unstake",
        claimRewards: "Yêu cầu thưởng",
        confirmClaim: "Xác nhận yêu cầu"
      },
      unstakeWaitDays: {
        "30days": "30 ngày",
        "15days": "15 ngày",
        "60days": "60 ngày"
      },
      placeholders: {
        enterStakeAmount: "Vui lòng nhập số lượng stake",
        enterUnstakeAmount: "Vui lòng nhập số lượng unstake"
      },
      title: {
        stakeAndUnstake: "Stake & Unstake",
        stakeOperations: "Hoạt động stake",
        unstakeOperations: "Hoạt động unstake",
        operationsHistory: "Lịch sử hoạt động"
      }
    }
  },
  // 韩语 (Korean)
  ko: {
    network: {
      warnning: "현재 환경은 테스트넷입니다. 모든 거래는 테스트넷에서만 유효하며 메인넷에 영향을 미치지 않습니다.",
      disconnect: "지갑 연결이 끊어졌습니다",
      connect: { error: "지갑 연결에 실패했습니다" }
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
      disclaimers: "면책 조항",
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
      admin: { exchangeSetup: "토큰 교환 비율 설정" }
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
        status: { success: "성공", pending: "처리 중", failed: "실패" },
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
      status: { success: "성공", pending: "처리 중", failed: "실패" }
    },
    admin: { title: "FAIR 생태계", exchange: { title: "FAIR 생태계" } },
    // 子模块翻译
    homeExchange: {
      burn: {
        reward: {
          title: "토큰 교환",
          amount: "소각된 FR 수량",
          placeholder: "소각할 수량을 입력하세요",
          token: "보상 토큰",
          token_placeholder: "보상 토큰을 선택하세요",
          button: "FR 소각",
          frBalance: "FR 토큰 잔액"
        }
      },
      logs: {
        burnLogs: "소각 로그"
      },
      exchange: {
        notOpen: "교환이 열리지 않았습니다",
        end: "종료",
        startTime: "시작 시간",
        endTime: "종료 시간",
        remainingAmount: "남은 양"
      }
    },
    homeStaking: {
      labels: {
        stakedFairBalance: "스테이크된 FAIR / FAIR 잔액",
        earnedFrBalance: "획득한 FR / FR 잔액",
        unstakeRequestAmount: "언스테이크 요청 수량",
        unstakeCountdown: "언스테이크 카운트다운",
        stakeAmountFair: "스테이크 수량 (FAIR)",
        unstakeAmountFair: "언스테이크 수량 (FAIR)",
        unstakeWaitPeriod: "언스테이크 대기 기간"
      },
      buttons: {
        stake: "스테이크",
        claim: "청구",
        withdraw: "출금",
        requestUnstake: "언스테이크 요청",
        cancel: "취소",
        confirmStake: "스테이크 확인",
        confirmUnstake: "언스테이크 요청 확인",
        confirmClaim: "청구 확인",
        refreshStats: "통계 새로 고침",
        refreshLogs: "로그 새로 고침"
      },
      modals: {
        stakeFair: "FAIR 스테이크",
        requestUnstake: "언스테이크 요청",
        claimRewards: "보상 청구",
        confirmClaim: "청구 확인"
      },
      unstakeWaitDays: {
        "30days": "30일",
        "15days": "15일",
        "60days": "60일"
      },
      placeholders: {
        enterStakeAmount: "스테이크 수량을 입력하세요",
        enterUnstakeAmount: "언스테이크 수량을 입력하세요"
      },
      title: {
        stakeAndUnstake: "스테이크 & 언스테이크",
        stakeOperations: "스테이크 작업",
        unstakeOperations: "언스테이크 작업",
        operationsHistory: "작업 기록"
      }
    }
  }
};

// 模块名称映射
const moduleNames = {
  'home-exchange': 'homeExchange',
  'home-staking': 'homeStaking'
};

// 翻译函数
function translateObject(original, language, currentModule = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(original)) {
    // 查找翻译
    let translatedValue;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归翻译对象
      translatedValue = translateObject(value, language, key);
    } else {
      // 查找具体翻译
      const moduleKey = moduleNames[currentModule] || '';
      
      if (moduleKey && allTranslations[language][moduleKey] && allTranslations[language][moduleKey][key] !== undefined) {
        // 子模块特定翻译
        translatedValue = allTranslations[language][moduleKey][key];
      } else if (allTranslations[language][key] !== undefined) {
        // 根目录翻译
        translatedValue = allTranslations[language][key];
      } else {
        // 对于嵌套结构的处理
        let found = false;
        // 尝试在子模块或根模块的嵌套结构中查找
        const searchIn = [
          ...(moduleKey ? [allTranslations[language][moduleKey]] : []),
          allTranslations[language]
        ];
        
        for (const obj of searchIn) {
          if (obj && typeof obj === 'object') {
            // 深度查找
            function deepFind(obj, currentPath) {
              if (typeof obj === 'object' && obj !== null) {
                for (const [k, v] of Object.entries(obj)) {
                  if (k === key) {
                    return v;
                  }
                  const foundInDeep = deepFind(v, [...currentPath, k]);
                  if (foundInDeep !== undefined) {
                    return foundInDeep;
                  }
                }
              }
              return undefined;
            }
            const foundValue = deepFind(obj, []);
            if (foundValue !== undefined) {
              translatedValue = foundValue;
              found = true;
              break;
            }
          }
        }
        // 如果找不到翻译，保持原样
        if (!found) {
          translatedValue = value;
        }
      }
    }
    result[key] = translatedValue;
  }
  return result;
}

// 主函数：为所有语言生成翻译文件
function generateAllTranslations() {
  const basePath = __dirname;
  // 读取根目录的 zh.json 文件作为原始数据
  const rootZhPath = path.join(basePath, 'i18n', 'zh.json');
  
  // 确保根目录的 zh.json 存在
  if (!fs.existsSync(rootZhPath)) {
    console.error('根目录的 zh.json 文件不存在！');
    return;
  }
  
  const rootOriginal = JSON.parse(fs.readFileSync(rootZhPath, 'utf8'));
  
  // 处理所有语言
  for (const lang of languages) {
    console.log(`处理语言: ${lang}`);
    
    // 处理根目录翻译文件
    const rootTranslated = translateObject(rootOriginal, lang);
    const rootOutPath = path.join(basePath, 'i18n', `${lang}.json`);
    fs.writeFileSync(rootOutPath, JSON.stringify(rootTranslated, null, 2), 'utf8');
    console.log(`  已生成: ${rootOutPath}`);
    
    // 处理子模块翻译文件
    const submodules = ['home', 'home-exchange', 'home-staking', 'admin-exchange'];
    for (const submodule of submodules) {
      const submoduleI18nPath = path.join(basePath, submodule, 'i18n');
      const submoduleZhPath = path.join(submoduleI18nPath, 'zh.json');
      
      if (fs.existsSync(submoduleZhPath)) {
        const submoduleOriginal = JSON.parse(fs.readFileSync(submoduleZhPath, 'utf8'));
        const submoduleTranslated = translateObject(submoduleOriginal, lang, submodule);
        const submoduleOutPath = path.join(submoduleI18nPath, `${lang}.json`);
        fs.writeFileSync(submoduleOutPath, JSON.stringify(submoduleTranslated, null, 2), 'utf8');
        console.log(`  已生成: ${submoduleOutPath}`);
      }
    }
  }
  
  console.log('所有翻译文件生成完成！');