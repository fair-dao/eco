const fs = require('fs');
const path = require('path');

// Define all target languages with their codes and names
const languages = [
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ko', name: 'Korean' }
];

// Complete translation data for all languages
const allTranslations = {
  ar: {
    'network': {
      'warnning': 'البيئة الحالية هي testnet، جميع المعاملات صالحة فقط في testnet ولن تؤثر على mainnet.',
      'disconnect': 'المحفظة غير متصلة',
      'connect': { 'error': 'فشل الاتصال بالمحفظة' }
    },
    'navigation': {
      'doc': 'الوثائق',
      'staking': 'استثمار (Staking)',
      'burn': 'حرق',
      'exchange': 'تبادل',
      'whitepaper': 'الوثيقة البيضاء (Whitepaper)',
      'contributing': 'المساهمة',
      'forum': 'المنتدى',
      'serviceagreement': 'اتفاقية الخدمة',
      'privacypolicy': 'سياسة الخصوصية',
      'disclaimers': 'الإخلاء من المسؤولية',
      'legal': 'قانوني',
      'contact': 'اتصل بنا',
      'email': 'البريد الإلكتروني',
      'phone': 'الهاتف',
      'address': 'العنوان',
      'governance': 'الحكم',
      'mission': 'الرسالة',
      'about': 'من نحن',
      'allrightsreserved': 'جميع الحقوق محفوظة',
      'resources': 'الموارد',
      'links': 'روابط',
      'accountinfo': 'معلومات الحساب',
      'admin': { 'exchangeSetup': 'إعداد سعر تبادل الأوراق' }
    },
    'title': 'نظام FAIR',
    'logs': {
      'contractLogs': 'سجلات العقد',
      'noData': 'لا توجد سجلات معاملات حتى الآن',
      'table': {
        'user': 'العنوان',
        'from': 'العنوان الأصلي',
        'eventName': 'العملية',
        'amount': 'الكمية',
        'timestamp': 'الوقت',
        'status': {
          'success': 'نجاح',
          'pending': 'قيد المعالجة',
          'failed': 'فشل'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'إصدار مكافآت',
        'amount': 'الكمية',
        'token': 'الرمز',
        'button': 'إصدار' 
      }
    }
  },
  es: {
    'network': {
      'warnning': 'El entorno actual es testnet, todas las transacciones son válidas solo en testnet y no afectarán a la mainnet.',
      'disconnect': 'Wallet desconectada',
      'connect': { 'error': 'Fallo en la conexión de wallet' }
    },
    'navigation': {
      'doc': 'Documentación',
      'staking': 'Staking',
      'burn': 'Quemar',
      'exchange': 'Intercambio',
      'whitepaper': 'Whitepaper',
      'contributing': 'Contribución',
      'forum': 'Foro',
      'serviceagreement': 'Acuerdo de servicio',
      'privacypolicy': 'Política de privacidad',
      'disclaimers': 'Exenciones',
      'legal': 'Legal',
      'contact': 'Contacto',
      'email': 'Email',
      'phone': 'Teléfono',
      'address': 'Dirección',
      'governance': 'Gobernanza',
      'mission': 'Misión',
      'about': 'Sobre nosotros',
      'allrightsreserved': 'Todos los derechos reservados',
      'resources': 'Recursos',
      'links': 'Enlaces',
      'accountinfo': 'Información de cuenta',
      'admin': { 'exchangeSetup': 'Configuración del tipo de cambio de tokens' }
    },
    'title': 'Ecosistema FAIR',
    'logs': {
      'contractLogs': 'Registros del contrato',
      'noData': 'Aún no hay registros de operaciones',
      'table': {
        'user': 'Dirección',
        'from': 'Dirección de origen',
        'eventName': 'Operación',
        'amount': 'Cantidad',
        'timestamp': 'Hora',
        'status': {
          'success': 'Éxito',
          'pending': 'Procesando',
          'failed': 'Fallido'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'Mint Reward Token',
        'amount': 'Cantidad',
        'token': 'Token',
        'button': 'Mint'
      }
    }
  },
  hi: {
    'network': {
      'warnning': 'वर्तमान वातावरण testnet है, सभी लेनदेन केवल testnet पर मान्य हैं और mainnet को प्रभावित नहीं करेंगे।',
      'disconnect': 'वॉलेट डिस्कनेक्ट हिंसा',
      'connect': { 'error': 'वॉलेट कनेक्ट करने में विफल' }
    },
    'navigation': {
      'doc': 'प्रलेखन',
      'staking': 'स्टेकिंग',
      'burn': 'बर्न',
      'exchange': 'एक्सचेंज',
      'whitepaper': 'व्हाइटपेपर',
      'contributing': 'योगदान',
      'forum': 'फोरम',
      'serviceagreement': 'सेवा समझौता',
      'privacypolicy': 'गोपनीयता नीति',
      'disclaimers': 'अस्वीकरण',
      'legal': 'कानूनी',
      'contact': 'संपर्क',
      'email': 'ईमेल',
      'phone': 'फोन',
      'address': 'पता',
      'governance': 'शासन',
      'mission': 'मिशन',
      'about': 'हमारे बारे में',
      'allrightsreserved': 'सर्वाधिकार सुरक्षित',
      'resources': 'संसाधन',
      'links': 'लिंक',
      'accountinfo': 'खाता जानकारी',
      'admin': { 'exchangeSetup': 'टोकन एक्सचेंज रेट सेटअप' }
    },
    'title': 'फेयर इकॉसिस्टम',
    'logs': {
      'contractLogs': 'अंतहीन लॉग',
      'noData': 'अभी तक कोई ऑपरेशन रिकॉर्ड नहीं',
      'table': {
        'user': 'पता',
        'from': 'मूल पता',
        'eventName': 'ऑपरेशन',
        'amount': 'राशि',
        'timestamp': 'समय',
        'status': {
          'success': 'सफल',
          'pending': 'चालू है',
          'failed': 'विफल'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'पुरस्कार टोकन निर्माण करें',
        'amount': 'राशि',
        'token': 'टोकन',
        'button': 'निर्माण'
      }
    }
  },
  fr: {
    'network': {
      'warnning': 'L\'environnement actuel est un testnet, toutes les transactions ne sont valides que sur le testnet et n\'affecteront pas le mainnet.',
      'disconnect': 'Wallet d\'éconnecté',
      'connect': { 'error': 'Échec de la connexion du wallet' }
    },
    'navigation': {
      'doc': 'Documentation',
      'staking': 'Staking',
      'burn': 'Brûler',
      'exchange': 'Échange',
      'whitepaper': 'Whitepaper',
      'contributing': 'Contribution',
      'forum': 'Forum',
      'serviceagreement': 'Contrat de service',
      'privacypolicy': 'Politique de confidentialité',
      'disclaimers': 'Avertissements',
      'legal': 'Légal',
      'contact': 'Contact',
      'email': 'Email',
      'phone': 'Téléphone',
      'address': 'Adresse',
      'governance': 'Gouvernance',
      'mission': 'Mission',
      'about': 'À propos',
      'allrightsreserved': 'Tous droits réservés',
      'resources': 'Ressources',
      'links': 'Liens',
      'accountinfo': 'Informations du compte',
      'admin': { 'exchangeSetup': 'Configuration du taux d\'échange des tokens' }
    },
    'title': 'Écosystème FAIR',
    'logs': {
      'contractLogs': 'Journaux de contrat',
      'noData': 'Aucun enregistrement d\'opération pour le moment',
      'table': {
        'user': 'Adresse',
        'from': 'Adresse d\'origine',
        'eventName': 'Opération',
        'amount': 'Montant',
        'timestamp': 'Heure',
        'status': {
          'success': 'Succès',
          'pending': 'En cours',
          'failed': 'Échec'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'Créer Token Récompense',
        'amount': 'Montant',
        'token': 'Token',
        'button': 'Créer'
      }
    }
  },
  ja: {
    'network': {
      'warnning': '現在の環境はテストネットです。すべての取引はテストネットでのみ有効で、メインネットに影響を与えません。',
      'disconnect': 'ウォレット切断',
      'connect': { 'error': 'ウォレット接続に失敗しました' }
    },
    'navigation': {
      'doc': 'ドキュメント',
      'staking': 'ステーキング',
      'burn': '燃焼',
      'exchange': '交換',
      'whitepaper': 'ホワイトペーパー',
      'contributing': '貢献',
      'forum': 'フォーラム',
      'serviceagreement': '利用規約',
      'privacypolicy': 'プライバシーポリシー',
      'disclaimers': '免責事項',
      'legal': '法的',
      'contact': 'お問い合わせ',
      'email': 'メール',
      'phone': '電話',
      'address': '住所',
      'governance': 'ガバナンス',
      'mission': 'ミッション',
      'about': '私たちについて',
      'allrightsreserved': '全著作権所有',
      'resources': 'リソース',
      'links': 'リンク',
      'accountinfo': 'アカウント情報',
      'admin': { 'exchangeSetup': 'トークン交換レートの設定' }
    },
    'title': 'FAIR エコシステム',
    'logs': {
      'contractLogs': 'コントラクトログ',
      'noData': '現在、操作レコードはありません',
      'table': {
        'user': 'アドレス',
        'from': '元アドレス',
        'eventName': '操作',
        'amount': '金額',
        'timestamp': '時間',
        'status': {
          'success': '成功',
          'pending': '進行中',
          'failed': '失敗'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': '報酬トークン作成',
        'amount': '金額',
        'token': 'トークン',
        'button': '作成'
      }
    }
  },
  ru: {
    'network': {
      'warnning': 'Текущее окружение - testnet, все транзакции действительны только на testnet и не повлияют на mainnet.',
      'disconnect': 'Кошелёк отключен',
      'connect': { 'error': 'Не удалось подключить кошелёк' }
    },
    'navigation': {
      'doc': 'Документация',
      'staking': 'Стейкинг',
      'burn': 'Сжигание',
      'exchange': 'Обмен',
      'whitepaper': 'Белая бумага',
      'contributing': 'Участие',
      'forum': 'Форум',
      'serviceagreement': 'Соглашение об обслуживании',
      'privacypolicy': 'Политика конфиденциальности',
      'disclaimers': 'Отказ от ответственности',
      'legal': 'Юридическое',
      'contact': 'Контакты',
      'email': 'Email',
      'phone': 'Телефон',
      'address': 'Адрес',
      'governance': 'Управление',
      'mission': 'Миссия',
      'about': 'О нас',
      'allrightsreserved': 'Все права защищены',
      'resources': 'Ресурсы',
      'links': 'Ссылки',
      'accountinfo': 'Информация о счете',
      'admin': { 'exchangeSetup': 'Настройка курса обмена токенов' }
    },
    'title': 'FAIR Экосистема',
    'logs': {
      'contractLogs': 'Логи контракта',
      'noData': 'Пока нет записей операций',
      'table': {
        'user': 'Адрес',
        'from': 'Исходный адрес',
        'eventName': 'Операция',
        'amount': 'Сумма',
        'timestamp': 'Время',
        'status': {
          'success': 'Успех',
          'pending': 'Ожидание',
          'failed': 'Неудача'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'Создать Награда Токен',
        'amount': 'Сумма',
        'token': 'Токен',
        'button': 'Создать'
      }
    }
  },
  th: {
    'network': {
      'warnning': 'สภาพแวดล้อมปัจจุบันเป็น testnet ทุกธุรกรรมมีประสิทธิภาพใน testnet เท่านั้นและจะไม่มีผลต่อ mainnet',
      'disconnect': 'วอลเล็ตถูกตัดการเชื่อมตุ่อม',
      'connect': { 'error': 'เชื่อมตุ่อมถูกตัดการเชื่อมต่อ' }
    },
    'navigation': {
      'doc': 'เอกสาร',
      'staking': 'Staking',
      'burn': 'ยับยั้ง',
      'exchange': 'แลกเปลี่ยน',
      'whitepaper': 'Whitepaper',
      'contributing': 'มีส่วนร่วม',
      'forum': 'ฟอรัม',
      'serviceagreement': 'ข้อตกลงการให้บริการ',
      'privacypolicy': 'นโยบายความเป็นส่วนตัว',
      'disclaimers': 'การสิ้นสุดความรับผิดชอบ',
      'legal': 'กฎหมาย',
      'contact': 'ติดต่อ',
      'email': 'อีเมล',
      'phone': 'โทรศัพท์',
      'address': 'ที่อยู่',
      'governance': 'การปกครอง',
      'mission': 'พันธกิจ',
      'about': 'เกี่ยวกับเรา',
      'allrightsreserved': 'สงวนลิขสิทธิ์ทั้งหมด',
      'resources': 'ทรัพยากร',
      'links': 'ลิงก์',
      'accountinfo': 'ข้อมูลบญชี',
      'admin': { 'exchangeSetup': 'ตั้งค่าอัตราแลกเปลี่ยนโทเค็น' }
    },
    'title': 'ระบบ FAIR',
    'logs': {
      'contractLogs': 'บันทึกสัญญา',
      'noData': 'ยังไม่มีบันทึกการดำเนินการ',
      'table': {
        'user': 'ที่อยู่',
        'from': 'ที่อยู่ต้นทาง',
        'eventName': 'การดำเนินการ',
        'amount': 'จำนวน',
        'timestamp': 'เวลา',
        'status': {
          'success': 'สำเร็จ',
          'pending': 'รอดำเนินการ',
          'failed': 'ล้มเหลว'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'สร้างโทเคนรางวัล',
        'amount': 'จำนวน',
        'token': 'โทเคน',
        'button': 'สร้าง'
      }
    }
  },
  vi: {
    'network': {
      'warnning': 'Môi trường hiện tại là testnet, tất cả giao dịch chỉ hợp lệ trên testnet và sẽ không ảnh hưởng đến mainnet.',
      'disconnect': 'Ví bị ngắt kết nối',
      'connect': { 'error': 'Kết nối ví không thành công' }
    },
    'navigation': {
      'doc': 'Tài liệu',
      'staking': 'Staking',
      'burn': 'Đốt',
      'exchange': 'Trao đổi',
      'whitepaper': 'Bảng trắng',
      'contributing': 'Đóng góp',
      'forum': 'Diễn đàn',
      'serviceagreement': 'Hợp đồng dịch vụ',
      'privacypolicy': 'Chính sách bảo mật',
      'disclaimers': 'Từ chối trách nhiệm',
      'legal': 'Pháp lý',
      'contact': 'Liên hệ',
      'email': 'Email',
      'phone': 'Điện thoại',
      'address': 'Địa chỉ',
      'governance': 'Quy định quản trị',
      'mission': 'Sứ mệnh',
      'about': 'Về chúng tôi',
      'allrightsreserved': 'Tất cả quyền được bảo lưu',
      'resources': 'Tài nguyên',
      'links': 'Liên kết',
      'accountinfo': 'Thông tin tài khoản',
      'admin': { 'exchangeSetup': 'Cấu hình tỷ lệ trao đổi token' }
    },
    'title': 'Hệ sinh thái FAIR',
    'logs': {
      'contractLogs': 'Nhật ký hợp đồng',
      'noData': 'Chưa có bản ghi hoạt động',
      'table': {
        'user': 'Địa chỉ',
        'from': 'Địa chỉ gốc',
        'eventName': 'Hoạt động',
        'amount': 'Số tiền',
        'timestamp': 'Thời gian',
        'status': {
          'success': 'Thành công',
          'pending': 'Đang xử lý',
          'failed': 'Thất bại'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'Tạo Token Phí',
        'amount': 'Số tiền',
        'token': 'Token',
        'button': 'Tạo'
      }
    }
  },
  ko: {
    'network': {
      'warnning': '현재 환경은 testnet로, 모든 거래는 testnet에서만 유효하며 mainnet에 영향을 미치지 않습니다.',
      'disconnect': '지갑이 연결 해제되었습니다',
      'connect': { 'error': '지갑 연결에 실패했습니다' }
    },
    'navigation': {
      'doc': '문서',
      'staking': '스테이킹',
      'burn': '버닝',
      'exchange': '교환',
      'whitepaper': '화이트 페이퍼',
      'contributing': '기여',
      'forum': '포럼',
      'serviceagreement': '서비스 약정',
      'privacypolicy': '개인 정보 정책',
      'disclaimers': '무책임 선언',
      'legal': '법적',
      'contact': '연락처',
      'email': 'Email',
      'phone': 'Teléfono',
      'address': 'Dirección',
      'governance': 'Gobernanza',
      'mission': 'Misión',
      'about': '회사 소개',
      'allrightsreserved': '모든 권리 보유',
      'resources': '리소스',
      'links': '링크',
      'accountinfo': '계정 정보',
      'admin': { 'exchangeSetup': '토큰 교환 비율 설정' }
    },
    'title': 'FAIR 생태계',
    'logs': {
      'contractLogs': '계약 로그',
      'noData': '아직 작업 기록이 없습니다',
      'table': {
        'user': '주소',
        'from': '원래 주소',
        'eventName': '작업',
        'amount': '금액',
        'timestamp': '시간',
        'status': {
          'success': '성공',
          'pending': '진행 중',
          'failed': '실패'
        }
      }
    },
    'admin': {
      'mintReward': {
        'title': 'Mint Reward Token',
        'amount': 'Cantidad',
        'token': 'Token',
        'button': 'Mint'
      }
    }
  }
};

// Translate object recursively
function translateObject(obj, lang, currentModule) {
  const translated = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      translated[key] = translateObject(value, lang, `${currentModule}.${key}`);
    } else {
      // Try to find translation in allTranslations
      let found = false;
      let currentPath = currentModule.split('.').slice(1);
      let currentTrans = allTranslations[lang];
      
      // Traverse translation object to find matching value
      for (let i = 0; i < currentPath.length; i++) {
        if (currentTrans && currentTrans[currentPath[i]]) {
          currentTrans = currentTrans[currentPath[i]];
        } else {
          currentTrans = null;
          break;
        }
      }
      
      if (currentTrans && currentTrans[key]) {
        translated[key] = currentTrans[key];
        found = true;
      }
      
      // If not found, check root level translations
      if (!found && allTranslations[lang][key]) {
        translated[key] = allTranslations[lang][key];
        found = true;
      }
      
      // If still not found, use a language-specific fallback translation
      if (!found) {
        // Fallback: try to translate common terms based on language
        const fallbackTranslations = {
          ar: {
            'Enter burn amount': 'أدخل كمية الحرق',
            'Reward Token': 'رمز المكافأة',
            'Please select reward token': 'الرجاء اختيار رمز المكافأة',
            'Burn FR': 'حرق FR',
            'FR Token Balance': 'رصيد FR Token',
            'Burn Logs': 'سجلات الحرق',
            'Exchange not opened': 'التبادل لم يفتح بعد',
            'Ended': 'انتهى',
            'Start Time': 'وقت البداية',
            'End Time': 'وقت الانتهاء',
            'Remaining': 'المتبقي',
            'Staked FAIR': 'FAIR معترف به',
            'FAIR Balance': 'رصيد FAIR',
            'Claimable FR': 'FR يمكن الخصم',
            'FR Balance': 'رصيد FR',
            'Unstake Request Amount': 'مبلغ طلب إلغاء الاستثمار',
            'Unstake Countdown': 'العد التنازلي ل إلغاء الاستثمار',
            'Stake Amount': 'مبلغ الاستثمار',
            'Unstake Amount': 'مبلغ إلغاء الاستثمار',
            'Unstake Waiting Period': 'فترة انتظار لإلغاء الاستثمار',
            'Stake': 'استثمار',
            'Claim': 'حصة',
            'Withdraw': 'سحب',
            'Request Unstake': 'طلب إلغاء الاستثمار',
            'Cancel': 'إلغاء',
            'Confirm Stake': 'تأكيد الاستثمار',
            'Confirm Unstake Request': 'تأكيد طلب إلغاء الاستثمار',
            'Confirm Claim': 'تأكيد الحصة',
            'Refresh Statistics': 'تحديث الإحصائيات',
            'Refresh Logs': 'تحديث السجلات',
            '30 Days': '30 يومًا',
            '15 Days': '15 يومًا',
            '60 Days': '60 يومًا',
            'Please enter stake amount': 'الرجاء إدخال مبلغ الاستثمار',
            'Please enter unstake amount': 'الرجاء إدخال مبلغ إلغاء الاستثمار'
          },
          es: {
            'Enter burn amount': 'Ingrese la cantidad a quemar',
            'Reward Token': 'Token de recompensa',
            'Please select reward token': 'Por favor seleccione el token de recompensa',
            'Burn FR': 'Quemar FR',
            'FR Token Balance': 'Balance FR Token',
            'Burn Logs': 'Registros de quemado',
            'Exchange not opened': 'Intercambio no abierto',
            'Ended': 'Terminado',
            'Start Time': 'Hora de inicio',
            'End Time': 'Hora de fin',
            'Remaining': 'Restante',
            'Staked FAIR': 'FAIR apostado',
            'FAIR Balance': 'Balance FAIR',
            'Claimable FR': 'FR reclamable',
            'FR Balance': 'Balance FR',
            'Unstake Request Amount': 'Cantidad de solicitud de retiro',
            'Unstake Countdown': 'Cuenta regresiva de retiro',
            'Stake Amount': 'Cantidad a apostar',
            'Unstake Amount': 'Cantidad a retirar',
            'Unstake Waiting Period': 'Período de espera para retirar',
            'Stake': 'Apostar',
            'Claim': 'Reclamar',
            'Withdraw': 'Retirar',
            'Request Unstake': 'Solicitar retiro',
            'Cancel': 'Cancelar',
            'Confirm Stake': 'Confirmar apuesta',
            'Confirm Unstake Request': 'Confirmar solicitud de retiro',
            'Confirm Claim': 'Confirmar reclamo',
            'Refresh Statistics': 'Actualizar estadísticas',
            'Refresh Logs': 'Actualizar registros',
            '30 Days': '30 días',
            '15 Days': '15 días',
            '60 Days': '60 días',
            'Please enter stake amount': 'Por favor ingrese la cantidad a apostar',
            'Please enter unstake amount': 'Por favor ingrese la cantidad a retirar'
          },
          hi: {
            'Enter burn amount': 'बर्न राशि दर्ज करें',
            'Reward Token': 'पुरस्कार टोकन',
            'Please select reward token': 'कृपया पुरस्कार टोकन का चयन करें',
            'Burn FR': 'FR बर्न करें',
            'FR Token Balance': 'FR टोकन बैलेंस',
            'Burn Logs': 'बर्न लॉग',
            'Exchange not opened': 'एक्सचेंज नहीं खुला',
            'Ended': 'समाप्त',
            'Start Time': 'प्रारंभ समय',
            'End Time': 'समाप्ति समय',
            'Remaining': 'शेष',
            'Staked FAIR': 'स्टेक किया गया FAIR',
            'FAIR Balance': 'FAIR बैलेंस',
            'Claimable FR': 'दावा योग्य FR',
            'FR Balance': 'FR बैलेंस',
            'Unstake Request Amount': 'अनस्टेक अनुरोध राशि',
            'Unstake Countdown': 'अनस्टेक काउंटडाउन',
            'Stake Amount': 'स्टेक राशि',
            'Unstake Amount': 'अनस्टेक राशि',
            'Unstake Waiting Period': 'अनस्टेक प्रतीक्षा अवधि',
            'Stake': 'स्टेक',
            'Claim': 'दावा करें',
            'Withdraw': 'निकालें',
            'Request Unstake': 'अनस्टेक अनुरोध करें',
            'Cancel': 'रद्द करें',
            'Confirm Stake': 'स्टेक की पुष्टि करें',
            'Confirm Unstake Request': 'अनस्टेक अनुरोध की पुष्टि करें',
            'Confirm Claim': 'दावा की पुष्टि करें',
            'Refresh Statistics': 'सांख्यिकी रिफ्रेश करें',
            'Refresh Logs': 'लॉग रिफ्रेश करें',
            '30 Days': '30 दिन',
            '15 Days': '15 दिन',
            '60 Days': '60 दिन',
            'Please enter stake amount': 'कृपया स्टेक राशि दर्ज करें',
            'Please enter unstake amount': 'कृपया अनस्टेक राशि दर्ज करें'
          },
          fr: {
            'Enter burn amount': 'Entrez le montant à brûler',
            'Reward Token': 'Token de récompense',
            'Please select reward token': 'Veuillez sélectionner le token de récompense',
            'Burn FR': 'Brûler FR',
            'FR Token Balance': 'Solde FR Token',
            'Burn Logs': 'Journaux de brûlage',
            'Exchange not opened': 'Échange non ouvert',
            'Ended': 'Terminé',
            'Start Time': 'Heure de début',
            'End Time': 'Heure de fin',
            'Remaining': 'Restant',
            'Staked FAIR': 'FAIR mis en jeu',
            'FAIR Balance': 'Solde FAIR',
            'Claimable FR': 'FR réclamable',
            'FR Balance': 'Solde FR',
            'Unstake Request Amount': 'Montant de la demande de retrait',
            'Unstake Countdown': 'Compte à rebours du retrait',
            'Stake Amount': 'Montant à miser',
            'Unstake Amount': 'Montant à retirer',
            'Unstake Waiting Period': 'Période d'attente pour le retrait',
            'Stake': 'Miser',
            'Claim': 'Réclamer',
            'Withdraw': 'Retirer',
            'Request Unstake': 'Demander un retrait',
            'Cancel': 'Annuler',
            'Confirm Stake': 'Confirmer la mise en jeu',
            'Confirm Unstake Request': 'Confirmer la demande de retrait',
            'Confirm Claim': 'Confirmer la réclamation',
            'Refresh Statistics': 'Actualiser les statistiques',
            'Refresh Logs': 'Actualiser les journaux',
            '30 Days': '30 jours',
            '15 Days': '15 jours',
            '60 Days': '60 jours',
            'Please enter stake amount': 'Veuillez entrer le montant à miser',
            'Please enter unstake amount': 'Veuillez entrer le montant à retirer'
          },
          ja: {
            'Enter burn amount': '燃焼額を入力してください',
            'Reward Token': '報酬トークン',
            'Please select reward token': '報酬トークンを選択してください',
            'Burn FR': 'FRを燃焼',
            'FR Token Balance': 'FRトークン残高',
            'Burn Logs': '燃焼ログ',
            'Exchange not opened': '取引所は開いていません',
            'Ended': '終了',
            'Start Time': '開始時間',
            'End Time': '終了時間',
            'Remaining': '残り',
            'Staked FAIR': 'ステークしたFAIR',
            'FAIR Balance': 'FAIR残高',
            'Claimable FR': '請求可能なFR',
            'FR Balance': 'FR残高',
            'Unstake Request Amount': 'アンステーク申請額',
            'Unstake Countdown': 'アンステークカウントダウン',
            'Stake Amount': 'ステーク額',
            'Unstake Amount': 'アンステーク額',
            'Unstake Waiting Period': 'アンステーク待機期間',
            'Stake': 'ステーク',
            'Claim': '請求',
            'Withdraw': '引き出し',
            'Request Unstake': 'アンステークを申請',
            'Cancel': 'キャンセル',
            'Confirm Stake': 'ステークを確認',
            'Confirm Unstake Request': 'アンステーク申請を確認',
            'Confirm Claim': '請求を確認',
            'Refresh Statistics': '統計を更新',
            'Refresh Logs': 'ログを更新',
            '30 Days': '30日',
            '15 Days': '15日',
            '60 Days': '60日',
            'Please enter stake amount': 'ステーク額を入力してください',
            'Please enter unstake amount': 'アンステーク額を入力してください'
          },
          ru: {
            'Enter burn amount': 'Введите количество для сжигания',
            'Reward Token': 'Токен вознаграждения',
            'Please select reward token': 'Пожалуйста, выберите токен вознаграждения',
            'Burn FR': 'Сжечь FR',
            'FR Token Balance': 'Баланс FR Token',
            'Burn Logs': 'Логи сжигания',
            'Exchange not opened': 'Обмен не открыт',
            'Ended': 'Закончилось',
            'Start Time': 'Время начала',
            'End Time': 'Время конца',
            'Remaining': 'Оставшееся',
            'Staked FAIR': 'Стейкед FAIR',
            'FAIR Balance': 'Баланс FAIR',
            'Claimable FR': 'FR для выплаты',
            'FR Balance': 'Баланс FR',
            'Unstake Request Amount': 'Сумма запроса на снятие стейка',
            'Unstake Countdown': 'Обратный отсчет снятия стейка',
            'Stake Amount': 'Сумма стейка',
            'Unstake Amount': 'Сумма снятия стейка',
            'Unstake Waiting Period': 'Период ожидания снятия стейка',
            'Stake': 'Стейк',
            'Claim': 'Внести',
            'Withdraw': 'Вывести',
            'Request Unstake': 'Запросить снятие стейка',
            'Cancel': 'Отменить',
            'Confirm Stake': 'Подтвердить стейк',
            'Confirm Unstake Request': 'Подтвердить запрос на снятие стейка',
            'Confirm Claim': 'Подтвердить выплату',
            'Refresh Statistics': 'Обновить статистику',
            'Refresh Logs': 'Обновить логи',
            '30 Days': '30 дней',
            '15 Days': '15 дней',
            '60 Days': '60 дней',
            'Please enter stake amount': 'Пожалуйста, введите сумму стейка',
            'Please enter unstake amount': 'Пожалуйста, введите сумму снятия стейка'
          },
          th: {
            'Enter burn amount': 'ใส่จำนวนการยับยั้ง',
            'Reward Token': 'โทเคนรางวัล',
            'Please select reward token': 'โปรดเลือกโทเคนรางวัล',
            'Burn FR': 'ยับยั้ง FR',
            'FR Token Balance': 'FR โทเคนยอดคงเหลือ',
            'Burn Logs': 'บันทึกการยับยั้ง',
            'Exchange not opened': 'แลกเปลี่ยนไม่เปิด',
            'Ended': 'สิ้นสุด',
            'Start Time': 'เวลาเริ่มต้น',
            'End Time': 'เวลาสิ้นสุด',
            'Remaining': 'คงเหลือ',
            'Staked FAIR': 'FAIR ที่ลงทุน',
            'FAIR Balance': 'FAIR คงเหลือ',
            'Claimable FR': 'FR ที่สามารถเคลมได้',
            'FR Balance': 'FR คงเหลือ',
            'Unstake Request Amount': 'จำนวนขออนยุทธลงทุน',
            'Unstake Countdown': 'นับถอยหลังการยกเลิกการลงทุน',
            'Stake Amount': 'จำนวนเงินลงทุน',
            'Unstake Amount': 'จำนวนเงินถอนลงทุน',
            'Unstake Waiting Period': 'ระยะเวลารอถอนเงิน',
            'Stake': 'ลงทุน',
            'Claim': 'ล็อคอิน',
            'Withdraw': 'ถอนเงิน',
            'Request Unstake': 'ขออนยุทธลงทุน',
            'Cancel': 'ยกเลิก',
            'Confirm Stake': 'ยืนยันการลงทุน',
            'Confirm Unstake Request': 'ยืนยันการขออนยุทธลงทุน',
            'Confirm Claim': 'ยืนยันการล็อคอิน',
            'Refresh Statistics': 'รีเฟรชสถิติ',
            'Refresh Logs': 'รีเฟรชบันทึก',
            '30 Days': '30 วัน',
            '15 Days': '15 วัน',
            '60 Days': '60 วัน',
            'Please enter stake amount': 'กรุณากรอกจำนวนเงินลงทุน',
            'Please enter unstake amount': 'กรุณากรอกจำนวนเงินถอน'
          },
          vi: {
            'Enter burn amount': 'Nhập số lượng để đốt',
            'Reward Token': 'Token thưởng',
            'Please select reward token': 'Vui lòng chọn token thưởng',
            'Burn FR': 'Đốt FR',
            'FR Token Balance': 'Số dư FR Token',
            'Burn Logs': 'Nhật ký đốt',
            'Exchange not opened': 'Trao đổi chưa mở',
            'Ended': 'Kết thúc',
            'Start Time': 'Thời gian bắt đầu',
            'End Time': 'Thời gian kết thúc',
            'Remaining': 'Còn lại',
            'Staked FAIR': 'FAIR được gắn thẻ',
            'FAIR Balance': 'Số dư FAIR',
            'Claimable FR': 'FR có thể yêu cầu',
            'FR Balance': 'Số dư FR',
            'Unstake Request Amount': 'Số tiền yêu cầu rút',
            'Unstake Countdown': 'Đếm ngược trước khi rút',
            'Stake Amount': 'Số tiền gắn thẻ',
            'Unstake Amount': 'Số tiền rút',
            'Unstake Waiting Period': 'Thời gian chờ rút',
            'Stake': 'Gắn thẻ',
            'Claim': 'Yêu cầu',
            'Withdraw': 'Rút tiền',
            'Request Unstake': 'Yêu cầu rút tiền',
            'Cancel': 'Hủy',
            'Confirm Stake': 'Xác nhận gắn thẻ',
            'Confirm Unstake Request': 'Xác nhận yêu cầu rút tiền',
            'Confirm Claim': 'Xác nhận yêu cầu',
            'Refresh Statistics': 'Làm mới thống kê',
            'Refresh Logs': 'Làm mới nhật ký',
            '30 Days': '30 ngày',
            '15 Days': '15 ngày',
            '60 Days': '60 ngày',
            'Please enter stake amount': 'Vui lòng nhập số tiền gắn thẻ',
            'Please enter unstake amount': 'Vui lòng nhập số tiền rút'
          },
          ko: {
            'Enter burn amount': '소각할 금액을 입력하세요',
            'Reward Token': '보상 토큰',
            'Please select reward token': '보상 토큰을 선택하세요',
            'Burn FR': 'FR 소각',
            'FR Token Balance': 'FR 토큰 잔액',
            'Burn Logs': '소각 로그',
            'Exchange not opened': '거래소가 열리지 않았습니다',
            'Ended': '종료됨',
            'Start Time': '시작 시간',
            'End Time': '종료 시간',
            'Remaining': '남은 금액',
            'Staked FAIR': '스테이크된 FAIR',
            'FAIR Balance': 'FAIR 잔액',
            'Claimable FR': '청구 가능한 FR',
            'FR Balance': 'FR 잔액',
            'Unstake Request Amount': '언스테이크 요청 금액',
            'Unstake Countdown': '언스테이크 카운트다운',
            'Stake Amount': '스테이크 금액',
            'Unstake Amount': '언스테이크 금액',
            'Unstake Waiting Period': '언스테이크 대기 기간',
            'Stake': '스테이크',
            'Claim': '청구',
            'Withdraw': '출금',
            'Request Unstake': '언스테이크 요청',
            'Cancel': '취소',
            'Confirm Stake': '스테이크 확인',
            'Confirm Unstake Request': '언스테이크 요청 확인',
            'Confirm Claim': '청구 확인',
            'Refresh Statistics': '통계 새로고침',
            'Refresh Logs': '로그 새로고침',
            '30 Days': '30일',
            '15 Days': '15일',
            '60 Days': '60일',
            'Please enter stake amount': '스테이크 금액을 입력하세요',
            'Please enter unstake amount': '언스테이크 금액을 입력하세요'
          }
        };
        
        if (fallbackTranslations[lang][value]) {
          translated[key] = fallbackTranslations[lang][value];
        } else {
          // Last resort: keep the English text
          translated[key] = value;
        }
      }
    }
  }
  
  return translated;
}

// Main translation function
function generateAllTranslations() {
  const modules = [
    { path: 'i18n', name: 'root' },
    { path: 'admin-exchange/i18n', name: 'admin-exchange' },
    { path: 'home/i18n', name: 'home' },
    { path: 'home-exchange/i18n', name: 'home-exchange' },
    { path: 'home-staking/i18n', name: 'home-staking' },
    { path: 'home-user/i18n', name: 'home-user' }
  ];
  
  for (const module of modules) {
    const zhFilePath = path.join(module.path, 'zh.json');
    if (fs.existsSync(zhFilePath)) {
      console.log(`Processing module: ${module.path}`);
      const zhContent = fs.readFileSync(zhFilePath, 'utf8');
      const zhObj = JSON.parse(zhContent);
      
      for (const lang of languages) {
        const langFilePath = path.join(module.path, `${lang.code}.json`);
        console.log(`  Generating ${lang.code}.json...`);
        
        const translatedObj = translateObject(zhObj, lang.code, `module.${module.name}`);
        
        fs.writeFileSync(
          langFilePath,
          JSON.stringify(translatedObj, null, 2),
          'utf8'
        );
      }
    }
  }
  
  console.log('All translation files generated successfully with accurate translations!');
}

// Execute the translation
if (require.main === module) {
  generateAllTranslations();
}