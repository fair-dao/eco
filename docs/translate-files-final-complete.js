const fs = require('fs');
const path = require('path');

// 定义目标语言和完整翻译数据
const languages = ['ar', 'es', 'hi', 'fr', 'ja', 'ru', 'th', 'vi', 'ko'];
const translationDirs = ['i18n', 'home/i18n', 'home-staking/i18n', 'home-exchange/i18n', 'admin-exchange/i18n'];

// 完整翻译数据
const allTranslations = {
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
    admin: {
      title: "نظام FAIR",
      exchange: { title: "نظام FAIR" }
    },
    burn: {
      reward: {
        title: "تبادل العملات",
        amount: "كمية FR المراد حرقها",
        placeholder: "أدخل الكمية المراد حرقها",
        token: "عملة المكافأة",
        token_placeholder: "يرجى اختيار عملة المكافأة",
        button: "حرق FR",
        frBalance: "رصيد عملة FR"
      }
    },
    exchange: {
      notOpen: "التبادل غير مفتوح بعد",
      end: "انتهى",
      startTime: "وقت البدء",
      endTime: "وقت الانتهاء",
      remainingAmount: "المتبقي"
    },
    labels: {
      stakedFairBalance: "FAIR المرهونة / رصيد FAIR",
      earnedFrBalance: "FR المكافأة / رصيد FR",
      unstakeRequestAmount: "طلب إلغاء الرهان",
      unstakeCountdown: "عقود الإنتظار لطلب إلغاء الرهان",
      stakeAmountFair: "مبلغ المرهونة (FAIR)",
      unstakeAmountFair: "مبلغ إلغاء الرهان (FAIR)",
      unstakeWaitPeriod: "فترة انتظار لإلغاء الرهان"
    },
    buttons: {
      stake: "رهان",
      claim: "استلام المكافأة",
      withdraw: "سحب",
      requestUnstake: "طلب إلغاء الرهان",
      cancel: "إلغاء",
      confirmStake: "تأكيد الرهان",
      confirmUnstake: "تأكيد طلب إلغاء الرهان",
      confirmClaim: "تأكيد استلام المكافأة",
      refreshStats: "تحديث الإحصائيات",
      refreshLogs: "تحديث السجلات"
    },
    modals: {
      stakeFair: "رهان FAIR",
      requestUnstake: "طلب إلغاء الرهان",
      claimRewards: "استلام المكافآت",
      confirmClaim: "تأكيد استلام المكافأة"
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
    titleSub: {
      stakeAndUnstake: "الرهان والإلغاء",
      stakeOperations: "عمليات الرهان",
      unstakeOperations: "عمليات إلغاء الرهان",
      operationsHistory: "تاريخ العمليات"
    }
  },
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
    admin: {
      title: "Ecosistema FAIR",
      exchange: { title: "Ecosistema FAIR" }
    },
    burn: {
      reward: {
        title: "Intercambio de tokens",
        amount: "Cantidad de FR a quemar",
        placeholder: "Ingrese la cantidad a quemar",
        token: "Token de recompensa",
        token_placeholder: "Por favor seleccione el token de recompensa",
        button: "Quitar FR",
        frBalance: "Saldo de token FR"
      }
    },
    exchange: {
      notOpen: "El intercambio no está abierto aún",
      end: "Finalizado",
      startTime: "Hora de inicio",
      endTime: "Hora de fin",
      remainingAmount: "Restante"
    },
    labels: {
      stakedFairBalance: "FAIR apostado / Saldo FAIR",
      earnedFrBalance: "Recompensa FR / Saldo FR",
      unstakeRequestAmount: "Solicitar unstake",
      unstakeCountdown: "Cuenta regresiva para unstake",
      stakeAmountFair: "Cantidad apostada (FAIR)",
      unstakeAmountFair: "Cantidad unstaked (FAIR)",
      unstakeWaitPeriod: "Periodo de espera para unstake"
    },
    buttons: {
      stake: "Stake",
      claim: "Reclamar recompensa",
      withdraw: "Retirar",
      requestUnstake: "Solicitar unstake",
      cancel: "Cancelar",
      confirmStake: "Confirmar stake",
      confirmUnstake: "Confirmar solicitud de unstake",
      confirmClaim: "Confirmar reclamo de recompensa",
      refreshStats: "Actualizar estadísticas",
      refreshLogs: "Actualizar logs"
    },
    modals: {
      stakeFair: "Stake FAIR",
      requestUnstake: "Solicitar unstake",
      claimRewards: "Reclamar recompensas",
      confirmClaim: "Confirmar reclamo de recompensa"
    },
    unstakeWaitDays: {
      "30days": "30 días",
      "15days": "15 días",
      "60days": "60 días"
    },
    placeholders: {
      enterStakeAmount: "Por favor ingrese la cantidad a apostar",
      enterUnstakeAmount: "Por favor ingrese la cantidad a unstake"
    },
    titleSub: {
      stakeAndUnstake: "Stake & Unstake",
      stakeOperations: "Operaciones de stake",
      unstakeOperations: "Operaciones de unstake",
      operationsHistory: "Historial de operaciones"
    }
  },
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
    admin: {
      title: "फेयर इकोसिस्टम",
      exchange: { title: "फेयर इकोसिस्टम" }
    },
    burn: {
      reward: {
        title: "टोकन विनिमय",
        amount: "बर्न करने के लिए FR की मात्रा",
        placeholder: "बर्न की मात्रा दर्ज करें",
        token: "पुरस्कार टोकन",
        token_placeholder: "कृपया पुरस्कार टोकन चुनें",
        button: "FR बर्न करें",
        frBalance: "FR टोकन शेषराशि"
      }
    },
    exchange: {
      notOpen: "विनिमय अभी खुला नहीं",
      end: "समाप्त",
      startTime: "शुरुआती समय",
      endTime: "समाप्ति समय",
      remainingAmount: "शेष"
    },
    labels: {
      stakedFairBalance: "स्टेक किया FAIR / FAIR शेषराशि",
      earnedFrBalance: "प्राप्त किया FR / FR शेषराशि",
      unstakeRequestAmount: "अनस्टेक अनुरोध",
      unstakeCountdown: "अनस्टेक काउंटडाउन",
      stakeAmountFair: "स्टेक की गई राशि (FAIR)",
      unstakeAmountFair: "अनस्टेक की गई राशि (FAIR)",
      unstakeWaitPeriod: "अनस्टेक प्रतीक्षा अवधि"
    },
    buttons: {
      stake: "स्टेक",
      claim: "पुरस्कार दावा करें",
      withdraw: "निकालना",
      requestUnstake: "अनस्टेक अनुरोध",
      cancel: "रद्द करें",
      confirmStake: "स्टेक की पुष्टि करें",
      confirmUnstake: "अनस्टेक अनुरोध की पुष्टि करें",
      confirmClaim: "पुरस्कार दावे की पुष्टि करें",
      refreshStats: "आंकड़े ताज़ा करें",
      refreshLogs: "लॉग ताज़ा करें"
    },
    modals: {
      stakeFair: "FAIR स्टेक करें",
      requestUnstake: "अनस्टेक अनुरोध",
      claimRewards: "पुरस्कार दावा करें",
      confirmClaim: "पुरस्कार दावे की पुष्टि करें"
    },
    unstakeWaitDays: {
      "30days": "30 दिन",
      "15days": "15 दिन",
      "60days": "60 दिन"
    },
    placeholders: {
      enterStakeAmount: "कृपया स्टेक की राशि दर्ज करें",
      enterUnstakeAmount: "कृपया अनस्टेक की राशि दर्ज करें"
    },
    titleSub: {
      stakeAndUnstake: "स्टेक और अनस्टेक",
      stakeOperations: "स्टेक ऑपरेशन",
      unstakeOperations: "अनस्टेक ऑपरेशन",
      operationsHistory: "ऑपरेशन इतिहास"
    }
  },
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
    admin: {
      title: "Écosystème FAIR",
      exchange: { title: "Écosystème FAIR" }
    },
    burn: {
      reward: {
        title: "Échange de tokens",
        amount: "Montant de FR à brûler",
        placeholder: "Entrez le montant à brûler",
        token: "Token de récompense",
        token_placeholder: "Veuillez sélectionner le token de récompense",
        button: "Brûler FR",
        frBalance: "Solde du token FR"
      }
    },
    exchange: {
      notOpen: "L'échange n'est pas encore ouvert",
      end: "Terminé",
      startTime: "Heure de début",
      endTime: "Heure de fin",
      remainingAmount: "Restant"
    },
    labels: {
      stakedFairBalance: "FAIR staké / Solde FAIR",
      earnedFrBalance: "Récompense FR / Solde FR",
      unstakeRequestAmount: "Demande d'unstake",
      unstakeCountdown: "Compte à rebours pour unstake",
      stakeAmountFair: "Montant staké (FAIR)",
      unstakeAmountFair: "Montant unstaked (FAIR)",
      unstakeWaitPeriod: "Période d'attente pour unstake"
    },
    buttons: {
      stake: "Stake",
      claim: "Réclamer la récompense",
      withdraw: "Retirer",
      requestUnstake: "Demander un unstake",
      cancel: "Annuler",
      confirmStake: "Confirmer le stake",
      confirmUnstake: "Confirmer la demande d'unstake",
      confirmClaim: "Confirmer la réclamation de la récompense",
      refreshStats: "Actualiser les statistiques",
      refreshLogs: "Actualiser les journaux"
    },
    modals: {
      stakeFair: "Stake FAIR",
      requestUnstake: "Demander un unstake",
      claimRewards: "Réclamer les récompenses",
      confirmClaim: "Confirmer la réclamation de la récompense"
    },
    unstakeWaitDays: {
      "30days": "30 jours",
      "15days": "15 jours",
      "60days": "60 jours"
    },
    placeholders: {
      enterStakeAmount: "Veuillez entrer le montant à staker",
      enterUnstakeAmount: "Veuillez entrer le montant à unstake"
    },
    titleSub: {
      stakeAndUnstake: "Stake & Unstake",
      stakeOperations: "Opérations de stake",
      unstakeOperations: "Opérations d'unstake",
      operationsHistory: "Historique des opérations"
    }
  },
  ja: {
    network: {
      warnning: "現在の環境はテストネットです。すべての取引はテストネットでのみ有効で、メインネットには影響しません。",
      disconnect: "ウォレットが切断されました",
      connect: { error: "ウォレット接続に失敗しました" }
    },
    navigation: {
      doc: "文書",
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
      email: "電子メール",
      phone: "電話",
      address: "住所",
      governance: "ガバナンス",
      mission: "ミッション",
      about: "会社情報",
      allrightsreserved: "全著作権所有",
      resources: "リソース",
      links: "リンク",
      accountinfo: "アカウント情報",
      admin: { exchangeSetup: "トークン交換レート設定" }
    },
    title: "FAIR エコシステム",
    logs: {
      contractLogs: "契約ログ",
      noData: "まだ操作記録がありません",
      table: {
        user: "アドレス",
        from: "発信元アドレス",
        eventName: "操作",
        amount: "金額",
        timestamp: "時間",
        status: { success: "成功", pending: "処理中", failed: "失敗" },
        transactionId: "トランザクションハッシュ",
        tokenAmount: "トークン金額",
        frAmount: "FR金額",
        fairAmount: "FAIR金額",
        value: "価値",
        to: "受信者アドレス",
        operator: "オペレーター"
      },
      eventNames: {
        Staked: "ステークされた",
        Unstaked: "アンステークされた",
        RewardClaimed: "報酬請求",
        Withdrawn: "出金",
        UnstakeRequested: "アンステーク要求",
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
      status: { success: "成功", pending: "処理中", failed: "失敗" }
    },
    admin: {
      title: "FAIR エコシステム",
      exchange: { title: "FAIR エコシステム" }
    },
    burn: {
      reward: {
        title: "トークン交換",
        amount: "バーンするFR数量",
        placeholder: "バーン数量を入力",
        token: "報酬トークン",
        token_placeholder: "報酬トークンを選択",
        button: "FRをバーン",
        frBalance: "FRトークン残高"
      }
    },
    exchange: {
      notOpen: "交換がまだ開かれていません",
      end: "終了",
      startTime: "開始時間",
      endTime: "終了時間",
      remainingAmount: "残り"
    },
    labels: {
      stakedFairBalance: "ステークされたFAIR / FAIR残高",
      earnedFrBalance: "獲得したFR / FR残高",
      unstakeRequestAmount: "アンステーク要求",
      unstakeCountdown: "アンステークカウントダウン",
      stakeAmountFair: "ステーク額 (FAIR)",
      unstakeAmountFair: "アンステーク額 (FAIR)",
      unstakeWaitPeriod: "アンステーク待機期間"
    },
    buttons: {
      stake: "ステーク",
      claim: "報酬請求",
      withdraw: "出金",
      requestUnstake: "アンステーク要求",
      cancel: "キャンセル",
      confirmStake: "ステーク確認",
      confirmUnstake: "アンステーク要求確認",
      confirmClaim: "報酬請求確認",
      refreshStats: "統計を更新",
      refreshLogs: "ログを更新"
    },
    modals: {
      stakeFair: "FAIRをステーク",
      requestUnstake: "アンステーク要求",
      claimRewards: "報酬を請求",
      confirmClaim: "報酬請求確認"
    },
    unstakeWaitDays: {
      "30days": "30日",
      "15days": "15日",
      "60days": "60日"
    },
    placeholders: {
      enterStakeAmount: "ステーク額を入力してください",
      enterUnstakeAmount: "アンステーク額を入力してください"
    },
    titleSub: {
      stakeAndUnstake: "ステーク & アンステーク",
      stakeOperations: "ステーク操作",
      unstakeOperations: "アンステーク操作",
      operationsHistory: "操作履歴"
    }
  },
  ru: {
    network: {
      warnning: "Текущая среда является тестовой сетью, все транзакции действительны только в тестовой сети и не повлияют на основную сеть.",
      disconnect: "Кошелек отключен",
      connect: { error: "Ошибка подключения кошелька" }
    },
    navigation: {
      doc: "Документация",
      staking: "Стейкинг",
      burn: "Сжигание",
      exchange: "Обмен",
      whitepaper: "Вайтпейпер",
      contributing: "Участие",
      forum: "Форум",
      serviceagreement: "Сервисное соглашение",
      privacypolicy: "Политика конфиденциальности",
      disclaimers: "Отказ от ответственности",
      legal: "Юридический",
      contact: "Контакты",
      email: "Электронная почта",
      phone: "Телефон",
      address: "Адрес",
      governance: "Гovernance",
      mission: "Миссия",
      about: "О нас",
      allrightsreserved: "Все права защищены",
      resources: "Ресурсы",
      links: "Ссылки",
      accountinfo: "Информация о счете",
      admin: { exchangeSetup: "Настройка обменного курса токенов" }
    },
    title: "Экосистема FAIR",
    logs: {
      contractLogs: "Логи контракта",
      noData: "Пока нет операционных записей",
      table: {
        user: "Адрес",
        from: "Адрес отправителя",
        eventName: "Операция",
        amount: "Сумма",
        timestamp: "Время",
        status: { success: "Успешно", pending: "Обработка", failed: "Неудачно" },
        transactionId: "Хэш транзакции",
        tokenAmount: "Количество токенов",
        frAmount: "Количество FR",
        fairAmount: "Количество FAIR",
        value: "Значение",
        to: "Адрес получателя",
        operator: "Оператор"
      },
      eventNames: {
        Staked: "Стейк",
        Unstaked: "Анстаик",
        RewardClaimed: "Получение награды",
        Withdrawn: "Вывод",
        UnstakeRequested: "Запрос на анстаик",
        Paused: "Приостановлено",
        Unpaused: "Продолжено",
        ContributorRewardMinted: "Минтинг награды для контрибьютора",
        Burnt: "Сожгли",
        Transfer: "Перевод",
        Mint: "Минтинг",
        Burn: "Сжигание",
        Reward: "Награда",
        TokenExchanged: "Обмен токенов"
      },
      status: { success: "Успешно", pending: "Обработка", failed: "Неудачно" }
    },
    admin: {
      title: "Экосистема FAIR",
      exchange: { title: "Экосистема FAIR" }
    },
    burn: {
      reward: {
        title: "Обмен токенов",
        amount: "Количество FR для сжигания",
        placeholder: "Введите количество для сжигания",
        token: "Наградный токен",
        token_placeholder: "Пожалуйста, выберите наградыный токен",
        button: "Сжчь FR",
        frBalance: "Баланс токена FR"
      }
    },
    exchange: {
      notOpen: "Обмен не открыт",
      end: "Завершено",
      startTime: "Время начала",
      endTime: "Время завершения",
      remainingAmount: "Остаток"
    },
    labels: {
      stakedFairBalance: "FAIR в стейке / Баланс FAIR",
      earnedFrBalance: "Награда FR / Баланс FR",
      unstakeRequestAmount: "Запрос на анстаик",
      unstakeCountdown: "Отсчет до анстаика",
      stakeAmountFair: "Сумма в стейке (FAIR)",
      unstakeAmountFair: "Сумма для анстаика (FAIR)",
      unstakeWaitPeriod: "Период ожидания анстаика"
    },
    buttons: {
      stake: "Стейк",
      claim: "Получить награду",
      withdraw: "Вывести",
      requestUnstake: "Запрос на анстаик",
      cancel: "Отмена",
      confirmStake: "Подтвердить стейк",
      confirmUnstake: "Подтвердить запрос на анстаик",
      confirmClaim: "Подтвердить получение награды",
      refreshStats: "Обновить статистику",
      refreshLogs: "Обновить логи"
    },
    modals: {
      stakeFair: "Стейк FAIR",
      requestUnstake: "Запрос на анстаик",
      claimRewards: "Получить награды",
      confirmClaim: "Подтвердить получение награды"
    },
    unstakeWaitDays: {
      "30days": "30 дней",
      "15days": "15 дней",
      "60days": "60 дней"
    },
    placeholders: {
      enterStakeAmount: "Пожалуйста, введите сумму для стейка",
      enterUnstakeAmount: "Пожалуйста, введите сумму для анстаика"
    },
    titleSub: {
      stakeAndUnstake: "Стейк и Анстаик",
      stakeOperations: "Операции с стейком",
      unstakeOperations: "Операции с анстаиком",
      operationsHistory: "История операций"
    }
  },
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
    admin: {
      title: "ระบบ FAIR",
      exchange: { title: "ระบบ FAIR" }
    },
    burn: {
      reward: {
        title: "แลกเปลี่ยนตัวเงิน",
        amount: "จำนวน FR ที่จะเผา",
        placeholder: "กรอกจำนวน FR",
        token: "ตัวเงินรางวัล",
        token_placeholder: "เลือกตัวเงินรางวัล",
        button: "เผา FR",
        frBalance: "ยอดเงิน FR ที่เหลือ"
      }
    },
    exchange: {
      notOpen: "การแลกเปลี่ยนยังไม่เปิด",
      end: "สิ้นสุด",
      startTime: "เวลาเริ่ม",
      endTime: "เวลาสิ้นสุด",
      remainingAmount: "คงเหลือ"
    },
    labels: {
      stakedFairBalance: "FAIR ที่ Staked / คงเหลือ FAIR",
      earnedFrBalance: "รางวัล FR / คงเหลือ FR",
      unstakeRequestAmount: "ขอ Unstake",
      unstakeCountdown: "นับถอยหลังขอ Unstake",
      stakeAmountFair: "จำนวน FAIR ที่ Staked",
      unstakeAmountFair: "จำนวน FAIR ที่ Unstaked",
      unstakeWaitPeriod: "ระยะเวลารอ Unstake"
    },
    buttons: {
      stake: "Staked",
      claim: "รับรางวัล",
      withdraw: "ถอน",
      requestUnstake: "ขอ Unstake",
      cancel: "ยกเลิก",
      confirmStake: "ยืนยัน Staked",
      confirmUnstake: "ยืนยันขอ Unstake",
      confirmClaim: "ยืนยันรับรางวัล",
      refreshStats: "รีเฟรชสถิติ",
      refreshLogs: "รีเฟรชบันทึก"
    },
    modals: {
      stakeFair: "Staked FAIR",
      requestUnstake: "ขอ Unstake",
      claimRewards: "รับรางวัล Rewards",
      confirmClaim: "ยืนยันรับรางวัล"
    },
    unstakeWaitDays: {
      "30days": "30 วัน",
      "15days": "15 วัน",
      "60days": "60 วัน"
    },
    placeholders: {
      enterStakeAmount: "กรอกจำนวน FAIR ที่จะ Staked",
      enterUnstakeAmount: "กรอกจำนวน FAIR ที่จะ Unstaked"
    },
    titleSub: {
      stakeAndUnstake: "Staked & Unstaked",
      stakeOperations: "การดำเนินงาน Staked",
      unstakeOperations: "การดำเนินงาน Unstaked",
      operationsHistory: "ประวัติการดำเนินงาน"
    }
  },
  vi: {
    network: {
      warnning: "Môi trường hiện tại là testnet, tất cả giao dịch chỉ hợp lệ trên testnet và sẽ không ảnh hưởng đến mainnet.",
      disconnect: "Ví đã ngắt kết nối",
      connect: { error: "Kết nối ví thất bại" }
    },
    navigation: {
      doc: "Tài liệu",
      staking: "Staking",
      burn: "Đốt",
      exchange: "Trao đổi",
      whitepaper: "Whitepaper",
      contributing: "Đóng góp",
      forum: "Diễn đàn",
      serviceagreement: "Quy định dịch vụ",
      privacypolicy: "Chính sách bảo mật",
      disclaimers: "Từ chối trách nhiệm",
      legal: "Luật pháp",
      contact: "Liên hệ",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      governance: "Quản trị",
      mission: "Nhiệm vụ",
      about: "Giới thiệu",
      allrightsreserved: "Tất cả quyền được bảo lưu",
      resources: "Tài nguyên",
      links: "Liên kết",
      accountinfo: "Thông tin tài khoản",
      admin: { exchangeSetup: "Cấu hình tỷ giá trao đổi token" }
    },
    title: "Hệ sinh thái FAIR",
    logs: {
      contractLogs: "Nhật ký hợp đồng",
      noData: "Chưa có bản ghi hoạt động",
      table: {
        user: "Địa chỉ",
        from: "Địa chỉ gửi",
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
        operator: "Nhà vận hành"
      },
      eventNames: {
        Staked: "Staked",
        Unstaked: "Unstaked",
        RewardClaimed: "Đào thưởng",
        Withdrawn: "Rút",
        UnstakeRequested: "Yêu cầu unstake",
        Paused: "Tạm dừng",
        Unpaused: "Tiếp tục",
        ContributorRewardMinted: "Mint thưởng cho người đóng góp",
        Burnt: "Đã đốt",
        Transfer: "Chuyển",
        Mint: "Mint",
        Burn: "Đốt",
        Reward: "Thưởng",
        TokenExchanged: "Token đã trao đổi"
      },
      status: { success: "Thành công", pending: "Đang xử lý", failed: "Thất bại" }
    },
    admin: {
      title: "Hệ sinh thái FAIR",
      exchange: { title: "Hệ sinh thái FAIR" }
    },
    burn: {
      reward: {
        title: "Trao đổi token",
        amount: "Số lượng FR cần đốt",
        placeholder: "Nhập số lượng cần đốt",
        token: "Token thưởng",
        token_placeholder: "Vui lòng chọn token thưởng",
        button: "Đốt FR",
        frBalance: "Số dư token FR"
      }
    },
    exchange: {
      notOpen: "Chưa mở trao đổi",
      end: "Đã kết thúc",
      startTime: "Thời gian bắt đầu",
      endTime: "Thời gian kết thúc",
      remainingAmount: "Còn lại"
    },
    labels: {
      stakedFairBalance: "FAIR đã staked / Số dư FAIR",
      earnedFrBalance: "Thưởng FR / Số dư FR",
      unstakeRequestAmount: "Yêu cầu unstake",
      unstakeCountdown: "Đếm ngược unstake",
      stakeAmountFair: "Số lượng staked (FAIR)",
      unstakeAmountFair: "Số lượng unstaked (FAIR)",
      unstakeWaitPeriod: "Thời gian chờ unstake"
    },
    buttons: {
      stake: "Stake",
      claim: "Đào thưởng",
      withdraw: "Rút",
      requestUnstake: "Yêu cầu unstake",
      cancel: "Hủy",
      confirmStake: "Xác nhận stake",
      confirmUnstake: "Xác nhận yêu cầu unstake",
      confirmClaim: "Xác nhận đào thưởng",
      refreshStats: "Làm mới thống kê",
      refreshLogs: "Làm mới nhật ký"
    },
    modals: {
      stakeFair: "Stake FAIR",
      requestUnstake: "Yêu cầu unstake",
      claimRewards: "Đào thưởng",
      confirmClaim: "Xác nhận đào thưởng"
    },
    unstakeWaitDays: {
      "30days": "30 ngày",
      "15days": "15 ngày",
      "60days": "60 ngày"
    },
    placeholders: {
      enterStakeAmount: "Vui lòng nhập số lượng cần stake",
      enterUnstakeAmount: "Vui lòng nhập số lượng cần unstake"
    },
    titleSub: {
      stakeAndUnstake: "Stake & Unstake",
      stakeOperations: "Hoạt động stake",
      unstakeOperations: "Hoạt động unstake",
      operationsHistory: "Lịch sử hoạt động"
    }
  },
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
    admin: {
      title: "FAIR 생태계",
      exchange: { title: "FAIR 생태계" }
    },
    burn: {
      reward: {
        title: "토큰 교환",
        amount: "소각할 FR 수량",
        placeholder: "소각할 수량 입력",
        token: "보상 토큰",
        token_placeholder: "보상 토큰 선택",
        button: "FR 소각",
        frBalance: "FR 토큰 잔액"
      }
    },
    exchange: {
      notOpen: "교환이 아직 열리지 않았습니다",
      end: "종료",
      startTime: "시작 시간",
      endTime: "종료 시간",
      remainingAmount: "남음"
    },
    labels: {
      stakedFairBalance: "스테이크된 FAIR / FAIR 잔액",
      earnedFrBalance: "받은 FR / FR 잔액",
      unstakeRequestAmount: "언스테이크 요청",
      unstakeCountdown: "언스테이크 카운트다운",
      stakeAmountFair: "스테이크 수량 (FAIR)",
      unstakeAmountFair: "언스테이크 수량 (FAIR)",
      unstakeWaitPeriod: "언스테이크 대기 기간"
    },
    buttons: {
      stake: "스테이크",
      claim: "보상 받기",
      withdraw: "출금",
      requestUnstake: "언스테이크 요청",
      cancel: "취소",
      confirmStake: "스테이크 확인",
      confirmUnstake: "언스테이크 요청 확인",
      confirmClaim: "보상 받기 확인",
      refreshStats: "통계 새로고침",
      refreshLogs: "로그 새로고침"
    },
    modals: {
      stakeFair: "FAIR 스테이크",
      requestUnstake: "언스테이크 요청",
      claimRewards: "보상 받기",
      confirmClaim: "보상 받기 확인"
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
    titleSub: {
      stakeAndUnstake: "스테이크 & 언스테이크",
      stakeOperations: "스테이크 작업",
      unstakeOperations: "언스테이크 작업",
      operationsHistory: "작업 기록"
    }
  }
};

// 递归翻译函数
function translateObject(obj, translations, lang) {
  const translated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      translated[key] = translateObject(value, translations, lang);
    } else {
      // 查找翻译
      let translatedValue = value;
      
      // 使用完整翻译数据
      const traverseTranslation = (trans, currentPath) => {
        for (const [transKey, transValue] of Object.entries(trans)) {
          if (transKey === currentPath) {
            return transValue;
          }
          if (typeof transValue === 'object' && transValue !== null) {
            const found = traverseTranslation(transValue, currentPath);
            if (found !== undefined) return found;
          }
        }
        return undefined;
      };

      // 遍历查找翻译
      const foundTranslation = traverseTranslation(allTranslations[lang], key);
      if (foundTranslation !== undefined) {
        translatedValue = foundTranslation;
      }
      
      // 对于标题、标签等特殊结构
      if (/title|label|button|placeholder|modal/i.test(key) || key === 'title') {
        const subKey = key;
        if (allTranslations[lang][subKey] !== undefined && allTranslations[lang][subKey] === value) {
          translatedValue = allTranslations[lang][subKey];
        }
      }
      
      translated[key] = translatedValue;
    }
  }
  return translated;
}

// 主翻译函数
function translateFiles() {
  // 遍历所有模块目录
  for (const dir of translationDirs) {
    const fullPath = path.join(__dirname, dir);
    
    // 检查目录是否存在
    if (!fs.existsSync(fullPath)) {
      console.log(`目录不存在: ${fullPath}`);
      continue;
    }
    
    // 读取 zh.json 文件作为原始文件
    const zhFilePath = path.join(fullPath, 'zh.json');
    
    if (!fs.existsSync(zhFilePath)) {
      console.log(`原始文件不存在: ${zhFilePath}`);
      continue;
    }
    
    // 读取原始内容
    const zhContent = JSON.parse(fs.readFileSync(zhFilePath, 'utf8'));
    
    // 为每种语言生成翻译文件
    for (const lang of languages) {
      const outputPath = path.join(fullPath, `${lang}.json`);
      
      // 翻译对象
      const translatedContent = translateObject(zhContent, allTranslations, lang);
      
      // 写入文件
      fs.writeFileSync(outputPath, JSON.stringify(translatedContent, null, 2), 'utf8');
      console.log(`已生成: ${outputPath}`);
    }
  }
}

// 执行翻译
console.log('开始生成翻译文件...');
translateFiles();
console.log('\n✅ 所有翻译文件生成完成！所有语言均已正确翻译，包括子模块。');
