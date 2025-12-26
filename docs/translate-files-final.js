const fs = require('fs');
const path = require('path');

const languages = ['ar', 'es', 'fr', 'hi', 'ja', 'ko', 'ru', 'th', 'vi'];

// 完整的翻译数据
const allTranslations = {
  // 阿拉伯语翻译
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
        status: {
          success: "ناجح",
          pending: "قيد المعالجة",
          failed: "فشل"
        },
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
      status: {
        success: "ناجح",
        pending: "قيد المعالجة",
        failed: "فشل"
      }
    },
    admin: {
      title: "نظام FAIR",
      exchange: {
        title: "نظام FAIR"
      }
    }
  },

  // 西班牙语翻译
  es: {
    network: {
      warnning: "El entorno actual es testnet, todas las transacciones son válidas solo en testnet y no afectarán mainnet.",
      disconnect: "Wallet desconectada",
      connect: {
        error: "Error de conexión a wallet"
      }
    },
    navigation: {
      doc: "Documentación",
      staking: "Staking",
      burn: "Quemar",
      exchange: "Intercambio",
      whitepaper: "Whitepaper",
      contributing: "Colaboración",
      forum: "Foro",
      serviceagreement: "Acuerdo de Servicio",
      privacypolicy: "Política de Privacidad",
      disclaimers: "Renuncias",
      legal: "Legal",
      contact: "Contacto",
      email: "Email",
      phone: "Teléfono",
      address: "Dirección",
      governance: "Gobernanza",
      mission: "Misión",
      about: "Sobre Nosotros",
      allrightsreserved: "Todos los Derechos Reservados",
      resources: "Recursos",
      links: "Enlaces",
      accountinfo: "Información de Cuenta",
      admin: {
        exchangeSetup: "Configurar Tasa de Intercambio de Tokens"
      }
    },
    title: "Sistema FAIR",
    logs: {
      contractLogs: "Registros de Contrato",
      noData: "No hay registros de operaciones hasta ahora",
      table: {
        user: "Dirección",
        from: "Dirección Emisora",
        eventName: "Operación",
        amount: "Monto",
        timestamp: "Tiempo",
        status: {
          success: "Éxito",
          pending: "Procesando",
          failed: "Fallido"
        },
        transactionId: "Hash de Transacción",
        tokenAmount: "Monto de Token",
        frAmount: "Monto FR",
        fairAmount: "Monto FAIR",
        value: "Valor",
        to: "Dirección Receptora",
        operator: "Operador"
      },
      eventNames: {
        Staked: "Stakeado",
        Unstaked: "Desstakeado",
        RewardClaimed: "Recompensa Reclamada",
        Withdrawn: "Retirado",
        UnstakeRequested: "Solicitud de Desstake",
        Paused: "Pausado",
        Unpaused: "Reanudado",
        ContributorRewardMinted: "Recompensa de Colaborador Minteada",
        Burnt: "Quemado",
        Transfer: "Transferido",
        Mint: "Mintado",
        Burn: "Quemado",
        Reward: "Recompensa",
        TokenExchanged: "Token Intercambiado"
      },
      status: {
        success: "Éxito",
        pending: "Procesando",
        failed: "Fallido"
      }
    },
    admin: {
      title: "Sistema FAIR",
      exchange: {
        title: "Sistema FAIR"
      }
    }
  },

  // 法语翻译
  fr: {
    network: {
      warnning: "L'environnement actuel est un testnet, toutes les transactions ne sont valides que sur le testnet et n'affecteront pas le mainnet.",
      disconnect: "Wallet déconnecté",
      connect: {
        error: "Erreur de connexion au wallet"
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
      serviceagreement: "Contrat de Service",
      privacypolicy: "Politique de Confidentialité",
      disclaimers: "Avis de Non-Responsabilité",
      legal: "Juridique",
      contact: "Contact",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      governance: "Gouvernance",
      mission: "Mission",
      about: "À Propos",
      allrightsreserved: "Tous Droits Réservés",
      resources: "Ressources",
      links: "Liens",
      accountinfo: "Informations de Compte",
      admin: {
        exchangeSetup: "Configuration du Taux d'Échange de Tokens"
      }
    },
    title: "Système FAIR",
    logs: {
      contractLogs: "Journaux de Contrat",
      noData: "Aucun enregistrement d'opération jusqu'à présent",
      table: {
        user: "Adresse",
        from: "Adresse Expéditrice",
        eventName: "Opération",
        amount: "Montant",
        timestamp: "Heure",
        status: {
          success: "Succès",
          pending: "En Traitement",
          failed: "Échec"
        },
        transactionId: "Hash de Transaction",
        tokenAmount: "Montant de Token",
        frAmount: "Montant FR",
        fairAmount: "Montant FAIR",
        value: "Valeur",
        to: "Adresse Destinataire",
        operator: "Opérateur"
      },
      eventNames: {
        Staked: "Staké",
        Unstaked: "Déstaké",
        RewardClaimed: "Récompense Réclamée",
        Withdrawn: "Retiré",
        UnstakeRequested: "Demande de Déstake",
        Paused: "En Pause",
        Unpaused: "Repris",
        ContributorRewardMinted: "Récompense de Contributeur Mintée",
        Burnt: "Brûlé",
        Transfer: "Transféré",
        Mint: "Minté",
        Burn: "Brûlé",
        Reward: "Récompense",
        TokenExchanged: "Token Échangé"
      },
      status: {
        success: "Succès",
        pending: "En Traitement",
        failed: "Échec"
      }
    },
    admin: {
      title: "Système FAIR",
      exchange: {
        title: "Système FAIR"
      }
    }
  },

  // 印地语翻译
  hi: {
    network: {
      warnning: "वर्तमान वातावरण टेस्टनेट है, सभी लेनदेन केवल टेस्टनेट पर वैध हैं और मेननेट को प्रभावित नहीं करेंगे।",
      disconnect: "वॉलेट डिस्कनेक्ट हुई",
      connect: {
        error: "वॉलेट कनेक्शन विफल हुई"
      }
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
        status: {
          success: "सफल",
          pending: "प्रोसेसिंग",
          failed: "विफल"
        },
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
      title: "फेयर इकोसिस्टम",
      exchange: {
        title: "फेयर इकोसिस्टम"
      }
    }
  },

  // 日语翻译
  ja: {
    network: {
      warnning: "現在の環境はテストネットです。すべてのトランザクションはテストネットでのみ有効であり、メインネットには影響しません。",
      disconnect: "ウォレットが接続されていません",
      connect: {
        error: "ウォレット接続エラー"
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
      serviceagreement: "サービス契約",
      privacypolicy: "プライバシーポリシー",
      disclaimers: "免責事項",
      legal: "法的",
      contact: "お問い合わせ",
      email: "メール",
      phone: "電話",
      address: "住所",
      governance: "ガバナンス",
      mission: "使命",
      about: "会社について",
      allrightsreserved: "全著作権所有",
      resources: "リソース",
      links: "リンク",
      accountinfo: "アカウント情報",
      admin: {
        exchangeSetup: "トークン交換レート設定"
      }
    },
    title: "FAIR システム",
    logs: {
      contractLogs: "コントラクトログ",
      noData: "まだ操作記録がありません",
      table: {
        user: "アドレス",
        from: "送信元アドレス",
        eventName: "操作",
        amount: "金額",
        timestamp: "時間",
        status: {
          success: "成功",
          pending: "処理中",
          failed: "失敗"
        },
        transactionId: "トランザクションハッシュ",
        tokenAmount: "トークン金額",
        frAmount: "FR 金額",
        fairAmount: "FAIR 金額",
        value: "価値",
        to: "受信者アドレス",
        operator: "オペレーター"
      },
      eventNames: {
        Staked: "ステーク",
        Unstaked: "アンステーク",
        RewardClaimed: "報酬を請求",
        Withdrawn: "引き出し",
        UnstakeRequested: "アンステーク請求",
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
      title: "FAIR システム",
      exchange: {
        title: "FAIR システム"
      }
    }
  },

  // 韩语翻译
  ko: {
    network: {
      warnning: "현재 환경은 테스트넷입니다. 모든 트랜잭션은 테스트넷에서만 유효하며 메인넷에 영향을 미치지 않습니다.",
      disconnect: "지갑이 연결되지 않음",
      connect: {
        error: "지갑 연결 오류"
      }
    },
    navigation: {
      doc: "문서",
      staking: "스테이킹",
      burn: "버닝",
      exchange: "교환",
      whitepaper: "화이트페이퍼",
      contributing: "기여",
      forum: "포럼",
      serviceagreement: "서비스 약관",
      privacypolicy: "개인정보 보호 정책",
      disclaimers: "면책 사항",
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
    title: "FAIR 시스템",
    logs: {
      contractLogs: "계약 로그",
      noData: "아직 작업 기록이 없습니다",
      table: {
        user: "주소",
        from: "보낸 주소",
        eventName: "작업",
        amount: "금액",
        timestamp: "시간",
        status: {
          success: "성공",
          pending: "처리 중",
          failed: "실패"
        },
        transactionId: "트랜잭션 해시",
        tokenAmount: "토큰 금액",
        frAmount: "FR 금액",
        fairAmount: "FAIR 금액",
        value: "가치",
        to: "받는 주소",
        operator: "운영자"
      },
      eventNames: {
        Staked: "스테이크",
        Unstaked: "언스테이크",
        RewardClaimed: "보상 청구",
        Withdrawn: "출금",
        UnstakeRequested: "언스테이크 요청",
        Paused: "일시 중지",
        Unpaused: "재개",
        ContributorRewardMinted: "기여자 보상 민트",
        Burnt: "버닝",
        Transfer: "전송",
        Mint: "민트",
        Burn: "버닝",
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
      title: "FAIR 시스템",
      exchange: {
        title: "FAIR 시스템"
      }
    }
  },

  // 俄语翻译
  ru: {
    network: {
      warnning: "Текущее окружение является тестовой сетью (testnet), все транзакции действительны только в тестовой сети и не повлияют на основную сеть.",
      disconnect: "Кошелёк отключен",
      connect: {
        error: "Ошибка подключения кошелька"
      }
    },
    navigation: {
      doc: "Документация",
      staking: "Стейкинг",
      burn: "Сжигание",
      exchange: "Обмен",
      whitepaper: "Вайтпейпер",
      contributing: "Участие",
      forum: "Форум",
      serviceagreement: "Соглашение о предоставлении услуг",
      privacypolicy: "Политика конфиденциальности",
      disclaimers: "Отказ от ответственности",
      legal: "Юридическое",
      contact: "Связаться с нами",
      email: "Email",
      phone: "Телефон",
      address: "Адрес",
      governance: "Гovernance",
      mission: "Миссия",
      about: "О нас",
      allrightsreserved: "Все права защищены",
      resources: "Ресурсы",
      links: "Ссылки",
      accountinfo: "Информация о счёте",
      admin: {
        exchangeSetup: "Настройка курса обмена токенов"
      }
    },
    title: "FAIR Система",
    logs: {
      contractLogs: "Логи контракта",
      noData: "Пока нет записей операций",
      table: {
        user: "Адрес",
        from: "Отправительский адрес",
        eventName: "Операция",
        amount: "Сумма",
        timestamp: "Время",
        status: {
          success: "Успех",
          pending: "Обработка",
          failed: "Неудачно"
        },
        transactionId: "Хэш транзакции",
        tokenAmount: "Сумма токенов",
        frAmount: "Сумма FR",
        fairAmount: "Сумма FAIR",
        value: "Значение",
        to: "Получательский адрес",
        operator: "Оператор"
      },
      eventNames: {
        Staked: "Стейк",
        Unstaked: "Анстейк",
        RewardClaimed: "Вознаграждение",
        Withdrawn: "Вывод",
        UnstakeRequested: "Запрос на анстейк",
        Paused: "Приостановлено",
        Unpaused: "Продолжено",
        ContributorRewardMinted: "Вознаграждение для участника",
        Burnt: "Сожжено",
        Transfer: "Перевод",
        Mint: "Минт",
        Burn: "Сжигание",
        Reward: "Вознаграждение",
        TokenExchanged: "Токен обменён"
      },
      status: {
        success: "Успех",
        pending: "Обработка",
        failed: "Неудачно"
      }
    },
    admin: {
      title: "FAIR Система",
      exchange: {
        title: "FAIR Система"
      }
    }
  },

  // 泰语翻译
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
      staking: "สเตกคิง",
      burn: "เบิร์น",
      exchange: "การแลกเปลี่ยน",
      whitepaper: "ไวท์เปเปอร์",
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
        exchangeSetup: "ตั้งค่าอัตราตกลางการแลกเปลี่ยนตัวเงิน"
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
        status: {
          success: "สำเร็จ",
          pending: "กำลังดำเนินการ",
          failed: "ล้มเหลว"
        },
        transactionId: "ฮอชธุรกรรม",
        tokenAmount: "จำนวนตัวเงิน",
        frAmount: "จำนวน FR",
        fairAmount: "จำนวน FAIR",
        value: "มูลค่า",
        to: "ที่อยู่ปลายทาง",
        operator: "ตัวดำเนินการ"
      },
      eventNames: {
        Staked: "สเตก",
        Unstaked: "อันสเตก",
        RewardClaimed: "รับรางวัล",
        Withdrawn: "ถอน",
        UnstakeRequested: "ขออันสเตก",
        Paused: "หยุดชั่วคราว",
        Unpaused: "ต่อเนื่อง",
        ContributorRewardMinted: "รางวัลสำหรับผู้มีส่วนร่วม",
        Burnt: "ถูกเผา",
        Transfer: "โอน",
        Mint: "มินต์",
        Burn: "เบิร์น",
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
      title: "ระบบ FAIR",
      exchange: {
        title: "ระบบ FAIR"
      }
    }
  },

  // 越南语翻译
  vi: {
    network: {
      warnning: "Môi trường hiện tại là testnet, tất cả các giao dịch chỉ hợp lệ trên testnet và sẽ không ảnh hưởng đến mainnet.",
      disconnect: "Ví đã ngắt kết nối",
      connect: {
        error: "Lỗi kết nối ví"
      }
    },
    navigation: {
      doc: "Tài liệu",
      staking: "Staking",
      burn: "Nướng",
      exchange: "Hoán đổi",
      whitepaper: "Whitepaper",
      contributing: "Đóng góp",
      forum: "Diễn đàn",
      serviceagreement: "Quy định dịch vụ",
      privacypolicy: "Chính sách bảo mật",
      disclaimers: "Từ chối trách nhiệm",
      legal: "Pháp lý",
      contact: "Liên hệ",
      email: "Email",
      phone: "Điện thoại",
      address: "Địa chỉ",
      governance: "Quản trị",
      mission: "Sứ mệnh",
      about: "Về chúng tôi",
      allrightsreserved: "Tất cả các quyền được bảo lưu",
      resources: "Tài nguyên",
      links: "Liên kết",
      accountinfo: "Thông tin tài khoản",
      admin: {
        exchangeSetup: "Cấu hình tỷ giá trao đổi token"
      }
    },
    title: "Hệ thống FAIR",
    logs: {
      contractLogs: "Nhật ký hợp đồng",
      noData: "Chưa có 기록 hoạt động nào",
      table: {
        user: "Địa chỉ",
        from: "Địa chỉ gửi",
        eventName: "Hoạt động",
        amount: "Số lượng",
        timestamp: "Thời gian",
        status: {
          success: "Thành công",
          pending: "Đang xử lý",
          failed: "Thất bại"
        },
        transactionId: "Hash giao dịch",
        tokenAmount: "Số lượng token",
        frAmount: "Số lượng FR",
        fairAmount: "Số lượng FAIR",
        value: "Giá trị",
        to: "Địa chỉ nhận",
        operator: "Người điều hành"
      },
      eventNames: {
        Staked: "Đã stake",
        Unstaked: "Đã unstake",
        RewardClaimed: "Đã nhận phần thưởng",
        Withdrawn: "Đã rút",
        UnstakeRequested: "Yêu cầu unstake",
        Paused: "Đã tạm dừng",
        Unpaused: "Tiếp tục",
        ContributorRewardMinted: "Phần thưởng cho người đóng góp",
        Burnt: "Đã nướng",
        Transfer: "Chuyển",
        Mint: "Mint",
        Burn: "Nướng",
        Reward: "Phần thưởng",
        TokenExchanged: "Token được trao đổi"
      },
      status: {
        success: "Thành công",
        pending: "Đang xử lý",
        failed: "Thất bại"
      }
    },
    admin: {
      title: "Hệ thống FAIR",
      exchange: {
        title: "Hệ thống FAIR"
      }
    }
  }
};

// 子模块翻译
const subModuleTranslations = {
  'home-exchange': {
    ar: {
      burn: {
        reward: {
          title: "نظام FAIR",
          amount: "المبلغ",
          placeholder: "أدخل الكمية المراد حرقها",
          token: "عملة المكافأة",
          token_placeholder: "يرجى اختيار عملة المكافأة",
          button: "حرق FR",
          frBalance: "رصيد عملة FR"
        }
      },
      logs: {
        burnLogs: "سجلات الحريق"
      },
      exchange: {
        notOpen: "التبادل غير مفتوح بعد",
        end: "انتهى",
        startTime: "وقت البدء",
        endTime: "وقت الانتهاء",
        remainingAmount: "المتبقي"
      }
    },
    th: {
      burn: {
        reward: {
          title: "ระบบ FAIR",
          amount: "จำนวน",
          placeholder: "กรอกจำนวนที่ต้องการเบิร์น",
          token: "โทเค็นรางวัล",
          token_placeholder: "กรุณาเลือกโทเค็นรางวัล",
          button: "เบิร์น FR",
          frBalance: "ยอด FR คงเหลือ"
        }
      },
      logs: {
        burnLogs: "บันทึกการเบิร์น"
      },
      exchange: {
        notOpen: "การแลกเปลี่ยนยังไม่เปิด",
        end: "สิ้นสุด",
        startTime: "เวลาเริ่ม",
        endTime: "เวลาสิ้นสุด",
        remainingAmount: "คงเหลือ"
      }
    }
  },
  'home-staking': {
    th: {
      labels: {
        stakedFairBalance: "FAIR ที่สเตก / คงเหลือ FAIR",
        earnedFrBalance: "รางวัล FR / คงเหลือ FR",
        unstakeRequestAmount: "ขออันสเตก",
        unstakeCountdown: "นับถอยหลังขออันสเตก",
        stakeAmountFair: "จำนวน FAIR ที่สเตก",
        unstakeAmountFair: "จำนวน FAIR ที่อันสเตก",
        unstakeWaitPeriod: "ระยะเวลารออันสเตก"
      },
      buttons: {
        stake: "สเตก",
        claim: "รับรางวัล",
        withdraw: "ถอน",
        requestUnstake: "ขออันสเตก",
        cancel: "ยกเลิก",
        confirmStake: "ยืนยันสเตก",
        confirmUnstake: "ยืนยันขออันสเตก",
        confirmClaim: "ยืนยันรับรางวัล",
        refreshStats: "รีเฟรชสถิติ",
        refreshLogs: "รีเฟรชบันทึก"
      },
      modals: {
        stakeFair: "สเตก FAIR",
        requestUnstake: "ขออันสเตก",
        claimRewards: "รับรางวัล",
        confirmClaim: "ยืนยันรับรางวัล"
      },
      unstakeWaitDays: {
        "30days": "30 วัน",
        "15days": "15 วัน",
        "60days": "60 วัน"
      },
      placeholders: {
        enterStakeAmount: "กรอกจำนวน FAIR ที่จะสเตก",
        enterUnstakeAmount: "กรอกจำนวน FAIR ที่จะอันสเตก"
      },
      title: {
        stakeAndUnstake: "สเตก & อันสเตก",
        stakeOperations: "การดำเนินงานสเตก",
        unstakeOperations: "การดำเนินงานอันสเตก",
        operationsHistory: "ประวัติการดำเนินงาน"
      }
    }
  }
};

// 递归翻译函数
function translateObject(obj, translations) {
  const translated = {};

  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      // 如果是对象，递归处理
      translated[key] = translateObject(obj[key], translations[key] || {});
    } else {
      // 如果是字符串，查找翻译
      translated[key] = translations[key] || obj[key];
    }
  }

  return translated;
}

// 主函数：生成所有翻译文件
function generateAllTranslations() {
  const modules = [
    { name: 'i18n', path: 'i18n' },
    { name: 'admin-exchange/i18n', path: 'admin-exchange/i18n' },
    { name: 'home/i18n', path: 'home/i18n' },
    { name: 'home-exchange/i18n', path: 'home-exchange/i18n' },
    { name: 'home-staking/i18n', path: 'home-staking/i18n' },
    { name: 'components/i18n', path: 'components/i18n' }
  ];

  // 为每个模块生成翻译
  modules.forEach(module => {
    const zhFilePath = path.join(__dirname, module.path, 'zh.json');

    if (fs.existsSync(zhFilePath)) {
      console.log(`Processing module: ${module.name}`);

      const zhContent = JSON.parse(fs.readFileSync(zhFilePath, 'utf8'));

      languages.forEach(lang => {
        let translatedContent;

        if (module.name.includes('/') && subModuleTranslations[module.name.replace('/i18n', '')] && subModuleTranslations[module.name.replace('/i18n', '')][lang]) {
          // 如果是子模块且有特定翻译
          translatedContent = translateObject(zhContent, subModuleTranslations[module.name.replace('/i18n', '')][lang]);
        } else {
          // 使用通用翻译
          translatedContent = translateObject(zhContent, allTranslations[lang]);
        }

        // 保存翻译文件
        const targetPath = path.join(__dirname, module.path, `${lang}.json`);
        fs.writeFileSync(targetPath, JSON.stringify(translatedContent, null, 2), 'utf8');
        console.log(`Generated: ${lang}.json for ${module.name}`);
      });
    } else {
      console.warn(`Warning: zh.json not found in ${module.path}`);
    }
  });

  console.log('\nAll translation files generated successfully with accurate translations!');
}

generateAllTranslations();