// Shopping interface translations. Product model names and customer-entered data stay unchanged.
const storeLanguages = {
  en: { locale: "en-PH", html: "en" },
  ja: { locale: "ja-JP", html: "ja" },
  es: { locale: "es-ES", html: "es" },
  fr: { locale: "fr-FR", html: "fr" },
  zh: { locale: "zh-CN", html: "zh-Hans" }
};

function storeLanguage() {
  const saved = localStorage.getItem("bitsAndBytesLanguage");
  return Object.hasOwn(storeLanguages, saved) ? saved : "en";
}

function storeLocale() {
  return storeLanguages[storeLanguage()].locale;
}

// Each row is English, Japanese, Spanish, French, then Simplified Chinese.
// Add a row here to translate another label without changing page layouts.
const storeTranslations = [
  ["Added to your cart", "カートに追加しました", "Añadido a tu carrito", "Ajouté à votre panier", "已加入购物车"],
  ["Saved to your wishlist", "お気に入りに保存しました", "Guardado en tus favoritos", "Ajouté à vos favoris", "已添加到收藏"],
  ["Removed from your wishlist", "お気に入りから削除しました", "Eliminado de tus favoritos", "Retiré de vos favoris", "已从收藏移除"],
  ["View wishlist", "お気に入りを見る", "Ver favoritos", "Voir les favoris", "查看收藏"],
  ["Open in Google Maps", "Google マップで開く", "Abrir en Google Maps", "Ouvrir dans Google Maps", "在 Google 地图中打开"],
  ["Nationwide delivery", "全国配送", "Envíos a todo el país", "Livraison nationale", "全国配送"],
  ["Delivered across the Philippines", "フィリピン全土にお届け", "Entregas en toda Filipinas", "Livraison dans toutes les Philippines", "配送覆盖菲律宾全境"],
  ["Home", "ホーム", "Inicio", "Accueil", "首页"],
  ["Shop Now", "商品を探す", "Comprar", "Boutique", "选购商品"],
  ["Explore", "もっと見る", "Explorar", "Découvrir", "探索"],
  ["Support", "サポート", "Ayuda", "Assistance", "客户支持"],
  ["Products", "商品", "Productos", "Produits", "商品"],
  ["Computer Products", "デスクトップPC", "Ordenadores", "Ordinateurs", "台式电脑"],
  ["Laptops", "ノートPC", "Portátiles", "Portables", "笔记本电脑"],
  ["Accessories", "アクセサリー", "Accesorios", "Accessoires", "配件"],
  ["Computer Parts", "PCパーツ", "Componentes de PC", "Pièces PC", "电脑硬件"],
  ["Build Your Own PC", "自作PCを組む", "Configura tu PC", "Configurer mon PC", "组装我的电脑"],
  ["Interactive Guide", "パーツガイド", "Guía interactiva", "Guide interactif", "交互指南"],
  ["About", "私たちについて", "Nosotros", "À propos", "关于我们"],
  ["About us", "私たちについて", "Sobre nosotros", "À propos de nous", "关于我们"],
  ["Contact", "お問い合わせ", "Contacto", "Contact", "联系我们"],
  ["Contact us", "お問い合わせ", "Contáctanos", "Nous contacter", "联系我们"],
  ["Downloads", "ダウンロード", "Descargas", "Téléchargements", "下载"],
  ["Login", "ログイン", "Iniciar sesión", "Connexion", "登录"],
  ["Cart", "カート", "Carrito", "Panier", "购物车"],
  ["View cart", "カートを見る", "Ver carrito", "Voir le panier", "查看购物车"],
  ["Wishlist", "お気に入り", "Favoritos", "Favoris", "收藏"],
  ["My account", "マイアカウント", "Mi cuenta", "Mon compte", "我的账户"],
  ["Your account", "アカウント", "Tu cuenta", "Votre compte", "您的账户"],
  ["Manage my account", "アカウント管理", "Gestionar mi cuenta", "Gérer mon compte", "管理账户"],
  ["My purchases", "購入履歴", "Mis compras", "Mes achats", "我的订单"],
  ["Address book", "アドレス帳", "Direcciones", "Carnet d’adresses", "地址簿"],
  ["Delivery tracking", "配送状況", "Seguimiento del envío", "Suivi de livraison", "物流追踪"],
  ["My favorites", "お気に入り", "Mis favoritos", "Mes favoris", "我的收藏"],
  ["Returns & refunds", "返品・返金", "Devoluciones y reembolsos", "Retours et remboursements", "退货与退款"],
  ["Sign out", "ログアウト", "Cerrar sesión", "Déconnexion", "退出登录"],
  ["Track Order", "注文を追跡", "Seguir pedido", "Suivre la commande", "追踪订单"],
  ["Menu", "メニュー", "Menú", "Menu", "菜单"],
  ["Language", "言語", "Idioma", "Langue", "语言"],
  ["Currency", "通貨", "Moneda", "Devise", "货币"],
  ["Converted prices are estimates. Checkout and payments are in PHP.", "換算価格は目安です。お会計・お支払いはフィリピンペソ（PHP）です。", "Los precios convertidos son orientativos. El pago se realiza en pesos filipinos (PHP).", "Les prix convertis sont indicatifs. Le paiement s’effectue en pesos philippins (PHP).", "换算价格仅供参考。结账与付款使用菲律宾比索（PHP）。"],
  ["The Bits and Bytes collection", "Bits and Bytesの商品", "La colección Bits and Bytes", "La collection Bits and Bytes", "Bits and Bytes 精选"],
  ["Find your next upgrade.", "次のアップグレードを見つけよう。", "Encuentra tu próxima mejora.", "Trouvez votre prochaine évolution.", "找到您的下一次升级。"],
  ["Find your next upgrade", "商品を検索", "Encuentra tu próxima mejora", "Trouvez votre prochaine évolution", "搜索升级产品"],
  ["Great hardware for the way you work, create, and play.", "仕事も、創作も、ゲームも。あなたに合う一台を。", "Tecnología para trabajar, crear y jugar a tu manera.", "Du matériel adapté à votre travail, vos créations et vos jeux.", "为工作、创作和游戏挑选合适的硬件。"],
  ["All products", "すべての商品", "Todos los productos", "Tous les produits", "全部商品"],
  ["Desktops", "デスクトップ", "Sobremesa", "PC fixes", "台式机"],
  ["Desktop PCs", "デスクトップPC", "PC de sobremesa", "PC fixes", "台式电脑"],
  ["Desktop PC", "デスクトップPC", "PC de sobremesa", "PC fixe", "台式电脑"],
  ["Laptop", "ノートPC", "Portátil", "Portable", "笔记本电脑"],
  ["Components", "パーツ", "Componentes", "Composants", "硬件"],
  ["Monitors", "モニター", "Monitores", "Écrans", "显示器"],
  ["Monitor", "モニター", "Monitor", "Écran", "显示器"],
  ["Accessory", "アクセサリー", "Accesorio", "Accessoire", "配件"],
  ["Computer Part", "PCパーツ", "Componente", "Composant", "电脑硬件"],
  ["Search", "検索", "Buscar", "Rechercher", "搜索"],
  ["Search a model, brand, or specification", "モデル・ブランド・仕様を検索", "Busca modelo, marca o especificación", "Rechercher un modèle, une marque ou une caractéristique", "搜索型号、品牌或规格"],
  ["Search products, brands...", "商品・ブランドを検索…", "Buscar productos, marcas…", "Rechercher produits, marques…", "搜索商品、品牌…"],
  ["Display", "表示", "Vista", "Affichage", "显示"],
  ["Grid", "グリッド", "Cuadrícula", "Grille", "网格"],
  ["List", "リスト", "Lista", "Liste", "列表"],
  ["Filters", "絞り込み", "Filtros", "Filtres", "筛选"],
  ["Filters & sort", "絞り込み・並び替え", "Filtros y orden", "Filtrer et trier", "筛选与排序"],
  ["Reset", "リセット", "Restablecer", "Réinitialiser", "重置"],
  ["Product Type", "商品タイプ", "Tipo de producto", "Type de produit", "商品类型"],
  ["Main Use", "主な用途", "Uso principal", "Utilisation", "主要用途"],
  ["All Uses", "すべての用途", "Todos los usos", "Tous les usages", "全部用途"],
  ["Sort By", "並び替え", "Ordenar por", "Trier par", "排序"],
  ["Featured", "おすすめ", "Destacados", "À la une", "推荐"],
  ["Price: Low to High", "価格の安い順", "Precio: menor a mayor", "Prix croissant", "价格从低到高"],
  ["Price: High to Low", "価格の高い順", "Precio: mayor a menor", "Prix décroissant", "价格从高到低"],
  ["Name: A to Z", "名前順", "Nombre: A a Z", "Nom : A à Z", "名称排序"],
  ["Price Range", "価格帯", "Rango de precio", "Fourchette de prix", "价格区间"],
  ["Minimum", "最低価格", "Mínimo", "Minimum", "最低"],
  ["Maximum", "最高価格", "Máximo", "Maximum", "最高"],
  ["Any price", "上限なし", "Cualquier precio", "Tous les prix", "不限价格"],
  ["In stock only", "在庫ありのみ", "Solo disponibles", "En stock uniquement", "仅看有货"],
  ["Brand", "ブランド", "Marca", "Marque", "品牌"],
  ["Gaming", "ゲーム", "Juegos", "Jeu", "游戏"],
  ["Office", "オフィス", "Oficina", "Bureautique", "办公"],
  ["Creator", "クリエイター", "Creación", "Création", "创作"],
  ["Student", "学生向け", "Estudiantes", "Études", "学生"],
  ["Build", "自作PC", "Montaje", "Assemblage", "组装"],
  ["RAM", "メモリー", "RAM", "RAM", "内存"],
  ["Storage", "ストレージ", "Almacenamiento", "Stockage", "存储"],
  ["Processors", "プロセッサー", "Procesadores", "Processeurs", "处理器"],
  ["Motherboards", "マザーボード", "Placas base", "Cartes mères", "主板"],
  ["Graphics Cards", "グラフィックカード", "Tarjetas gráficas", "Cartes graphiques", "显卡"],
  ["Power Supplies", "電源ユニット", "Fuentes de alimentación", "Alimentations", "电源"],
  ["Cases", "PCケース", "Cajas", "Boîtiers", "机箱"],
  ["Cooling", "冷却", "Refrigeración", "Refroidissement", "散热"],
  ["Desktops & monitors", "デスクトップ・モニター", "Sobremesa y monitores", "PC fixes et écrans", "台式机与显示器"],
  ["Quick View", "クイック表示", "Vista rápida", "Aperçu rapide", "快速查看"],
  ["Full Details", "詳細を見る", "Ver detalles", "Voir les détails", "查看详情"],
  ["Add to Cart", "カートに追加", "Añadir al carrito", "Ajouter au panier", "加入购物车"],
  ["Out of stock", "在庫切れ", "Agotado", "Rupture de stock", "缺货"],
  ["Color", "カラー", "Color", "Couleur", "颜色"],
  ["Capacity", "容量", "Capacidad", "Capacité", "容量"],
  ["Quantity", "数量", "Cantidad", "Quantité", "数量"],
  ["Product", "商品", "Producto", "Produit", "商品"],
  ["Price", "価格", "Precio", "Prix", "价格"],
  ["Specifications", "仕様", "Especificaciones", "Caractéristiques", "规格"],
  ["Main", "正面", "Principal", "Principale", "主图"],
  ["Side", "側面", "Lateral", "Profil", "侧面"],
  ["Detail", "詳細", "Detalle", "Détail", "细节"],
  ["Ports", "端子", "Puertos", "Connectique", "接口"],
  ["Closeup", "拡大", "Primer plano", "Gros plan", "特写"],
  ["Close", "閉じる", "Cerrar", "Fermer", "关闭"],
  ["Compare your shortlist", "候補を比較", "Compara tus favoritos", "Comparer votre sélection", "比较心仪商品"],
  ["Up to 3 configurations", "最大3構成", "Hasta 3 configuraciones", "Jusqu’à 3 configurations", "最多3种配置"],
  ["First product", "商品1", "Primer producto", "Premier produit", "第一件商品"],
  ["Second product", "商品2", "Segundo producto", "Deuxième produit", "第二件商品"],
  ["Third product", "商品3", "Tercer producto", "Troisième produit", "第三件商品"],
  ["Clear comparison", "比較をクリア", "Borrar comparación", "Effacer la comparaison", "清空比较"],
  ["Choose products to start your comparison.", "比較する商品を選んでください。", "Elige productos para compararlos.", "Choisissez des produits à comparer.", "选择商品以开始比较。"],
  ["Find the right setup", "ぴったりの構成を探す", "Encuentra tu equipo ideal", "Trouvez la bonne configuration", "找到合适的配置"],
  ["Buying guide", "購入ガイド", "Guía de compra", "Guide d’achat", "选购指南"],
  ["Quick order", "クイック注文", "Pedido rápido", "Commande rapide", "快捷下单"],
  ["Already know what you need?", "お探しの商品はお決まりですか？", "¿Ya sabes lo que necesitas?", "Vous savez déjà ce qu’il vous faut ?", "已经知道需要什么？"],
  ["Order total", "注文合計", "Total del pedido", "Total de la commande", "订单总额"],
  ["Your cart", "カート", "Tu carrito", "Votre panier", "您的购物车"],
  ["Shopping cart", "ショッピングカート", "Carrito de compra", "Panier", "购物车"],
  ["Your cart is empty.", "カートは空です。", "Tu carrito está vacío.", "Votre panier est vide.", "购物车为空。"],
  ["Continue shopping", "お買い物を続ける", "Seguir comprando", "Continuer mes achats", "继续购物"],
  ["Remove", "削除", "Eliminar", "Supprimer", "移除"],
  ["Subtotal", "小計", "Subtotal", "Sous-total", "小计"],
  ["Total", "合計", "Total", "Total", "合计"],
  ["Checkout", "お会計", "Finalizar compra", "Passer commande", "结账"],
  ["Proceed to Checkout", "お会計に進む", "Finalizar compra", "Passer commande", "前往结账"],
  ["Items subtotal", "商品小計", "Subtotal de productos", "Sous-total des articles", "商品小计"],
  ["Total (PHP)", "合計（PHP）", "Total (PHP)", "Total (PHP)", "合计（PHP）"],
  ["Standard delivery", "通常配送", "Envío estándar", "Livraison standard", "标准配送"],
  ["Express delivery", "速達配送", "Envío exprés", "Livraison express", "加急配送"],
  ["Delivery options", "配送オプション", "Opciones de envío", "Options de livraison", "配送选项"],
  ["Delivery address", "配送先住所", "Dirección de envío", "Adresse de livraison", "收货地址"],
  ["First name", "名", "Nombre", "Prénom", "名字"],
  ["Middle name", "ミドルネーム", "Segundo nombre", "Deuxième prénom", "中间名"],
  ["Surname", "姓", "Apellidos", "Nom de famille", "姓氏"],
  ["Suffix", "接尾辞", "Sufijo", "Suffixe", "姓名后缀"],
  ["Email address", "メールアドレス", "Correo electrónico", "Adresse e-mail", "电子邮箱"],
  ["Phone number", "電話番号", "Teléfono", "Téléphone", "电话号码"],
  ["Province", "州・地域", "Provincia", "Province", "省份"],
  ["City / municipality", "市・自治体", "Ciudad / municipio", "Ville / municipalité", "城市／市镇"],
  ["Barangay", "バランガイ", "Barangay", "Barangay", "社区（Barangay）"],
  ["Postal code", "郵便番号", "Código postal", "Code postal", "邮政编码"],
  ["Payment method", "お支払い方法", "Método de pago", "Mode de paiement", "支付方式"],
  ["Cash on Delivery", "代金引換", "Pago contra entrega", "Paiement à la livraison", "货到付款"],
  ["Place Order", "注文する", "Realizar pedido", "Confirmer la commande", "提交订单"],
  ["You are all set", "準備が整いました", "Todo listo", "Tout est prêt", "一切就绪"],
  ["Sign in", "ログイン", "Iniciar sesión", "Se connecter", "登录"],
  ["Welcome back", "おかえりなさい", "Bienvenido de nuevo", "Bon retour", "欢迎回来"],
  ["Password", "パスワード", "Contraseña", "Mot de passe", "密码"],
  ["Show", "表示", "Mostrar", "Afficher", "显示"],
  ["Hide", "非表示", "Ocultar", "Masquer", "隐藏"],
  ["Enter your password", "パスワードを入力", "Introduce tu contraseña", "Saisissez votre mot de passe", "输入密码"],
  ["Create an account", "アカウントを作成", "Crear una cuenta", "Créer un compte", "创建账户"],
  ["Register", "登録", "Registrarse", "S’inscrire", "注册"],
  ["Remember my email on this device", "この端末でメールアドレスを記憶", "Recordar mi correo en este dispositivo", "Mémoriser mon e-mail sur cet appareil", "在此设备记住邮箱"],
  ["Contact support.", "サポートに連絡。", "Contacta con soporte.", "Contacter l’assistance.", "联系客服。"],
  ["Account details", "アカウント情報", "Datos de la cuenta", "Informations du compte", "账户信息"],
  ["Favorites", "お気に入り", "Favoritos", "Favoris", "收藏"],
  ["All", "すべて", "Todos", "Tout", "全部"],
  ["To receive", "配送待ち", "Por recibir", "À recevoir", "待收货"],
  ["Completed", "完了", "Completados", "Terminées", "已完成"],
  ["Delivered", "配達済み", "Entregado", "Livré", "已送达"],
  ["Save changes", "変更を保存", "Guardar cambios", "Enregistrer", "保存更改"],
  ["Add address", "住所を追加", "Añadir dirección", "Ajouter une adresse", "添加地址"],
  ["Edit", "編集", "Editar", "Modifier", "编辑"],
  ["Delete", "削除", "Eliminar", "Supprimer", "删除"],
  ["Cancel", "キャンセル", "Cancelar", "Annuler", "取消"],
  ["Default", "既定", "Predeterminada", "Par défaut", "默认"],
  ["Set as default", "既定に設定", "Establecer por defecto", "Définir par défaut", "设为默认"],
  ["Send an inquiry", "お問い合わせを送る", "Enviar consulta", "Envoyer une demande", "发送咨询"],
  ["Send message", "メッセージを送信", "Enviar mensaje", "Envoyer le message", "发送消息"],
  ["Message", "メッセージ", "Mensaje", "Message", "留言"],
  ["Subject", "件名", "Asunto", "Objet", "主题"],
  ["Chat with us", "チャットで相談", "Chatea con nosotros", "Discuter avec nous", "在线咨询"],
  ["Privacy", "プライバシー", "Privacidad", "Confidentialité", "隐私"],
  ["Privacy Policy", "プライバシーポリシー", "Política de privacidad", "Politique de confidentialité", "隐私政策"],
  ["Terms of Use", "利用規約", "Términos de uso", "Conditions d’utilisation", "使用条款"],
  ["Warranty", "保証", "Garantía", "Garantie", "保修"],
  ["Proudly trusted by", "取り扱いブランド", "Marcas de confianza", "Des marques de confiance", "值得信赖的品牌"],
  ["Hear What Our Customers Say", "お客様の声", "Lo que dicen nuestros clientes", "Les avis de nos clients", "听听顾客怎么说"],
  ["Setup notebook", "セットアップノート", "Cuaderno de ideas", "Carnet de configurations", "装机笔记"],
  ["Browse laptops", "ノートPCを見る", "Ver portátiles", "Voir les portables", "浏览笔记本电脑"],
  ["Explore desktop systems", "デスクトップを見る", "Ver ordenadores", "Voir les PC fixes", "探索台式电脑"],
  ["Shop components", "パーツを探す", "Comprar componentes", "Voir les composants", "选购硬件"],
  ["Download guides", "ガイドをダウンロード", "Descargar guías", "Télécharger les guides", "下载指南"],
  ["Show laptop", "ノートPCを表示", "Mostrar portátil", "Afficher le portable", "显示笔记本电脑"],
  ["Hide laptop", "ノートPCを隠す", "Ocultar portátil", "Masquer le portable", "隐藏笔记本电脑"],
  ["Shop", "ショップ", "Tienda", "Boutique", "商店"],
  ["Help", "ヘルプ", "Ayuda", "Aide", "帮助"],
  ["Account", "アカウント", "Cuenta", "Compte", "账户"],
  ["Main navigation", "メインナビゲーション", "Navegación principal", "Navigation principale", "主导航"],
  ["Product categories", "商品カテゴリー", "Categorías de productos", "Catégories de produits", "商品分类"],
  ["PCs, laptops & components", "PC・ノートPC・パーツ", "Ordenadores, portátiles y componentes", "Ordinateurs, portables et composants", "电脑、笔记本与硬件"],
  ["The right tools. Your next chapter.", "次の一歩に、ぴったりの道具を。", "Las herramientas para tu próxima etapa.", "Les bons outils pour votre prochain chapitre.", "理想装备，开启新篇章。"],
  ["For the game you want to play, the project you want to finish, and everything you do in between. Find your next setup here.", "遊びたいゲームも、完成させたいプロジェクトも。あなたの毎日に合う一台を、ここで見つけよう。", "Para tus juegos, tus proyectos y todo lo demás. Encuentra aquí tu próximo equipo.", "Pour vos jeux, vos projets et tout le reste. Trouvez ici votre prochain équipement.", "无论是畅玩游戏、完成项目，还是处理日常事务，都能在这里找到适合您的装备。"],
  ["Shop Products", "商品を見る", "Ver productos", "Voir les produits", "选购商品"],
  ["Desktop systems", "デスクトップPC", "Equipos de sobremesa", "PC fixes", "台式电脑"],
  ["Desk essentials", "デスク周りの必需品", "Esenciales de escritorio", "Essentiels du bureau", "桌面必备"],
  ["Gaming systems", "ゲーミングPC", "Equipos para jugar", "PC gaming", "游戏电脑"],
  ["Level up your setup", "環境をレベルアップ", "Mejora tu equipo", "Améliorez votre configuration", "升级您的装备"],
  ["Portable performance", "持ち運べるパワー", "Potencia portátil", "La puissance mobile", "便携性能"],
  ["Work anywhere", "どこでも作業を", "Trabaja donde quieras", "Travaillez partout", "随时随地工作"],
  ["Custom builds", "カスタムPC", "Equipos a medida", "PC sur mesure", "定制组装"],
  ["Choose every component", "パーツを一つずつ選ぶ", "Elige cada componente", "Choisissez chaque composant", "自由选择每个硬件"],
  ["Start Your Build", "構成を始める", "Empieza tu configuración", "Commencer ma configuration", "开始组装"],
  ["Shop Gaming PCs", "ゲーミングPCを見る", "Ver PC para juegos", "Voir les PC gaming", "选购游戏电脑"],
  ["Shop Desk Gear", "デスク用品を見る", "Ver accesorios", "Voir les accessoires", "选购桌面配件"],
  ["Meet Microsoft", "Microsoftの製品", "Descubre Microsoft", "Découvrez Microsoft", "了解 Microsoft"],
  ["Room for your next idea", "次のアイデアが広がる", "Espacio para tu próxima idea", "Place à votre prochaine idée", "为下一个灵感留出空间"],
  ["Shop Microsoft", "Microsoftを見る", "Comprar Microsoft", "Voir Microsoft", "选购 Microsoft"],
  ["Explore Microsoft", "Microsoftをもっと見る", "Explorar Microsoft", "Découvrir Microsoft", "探索 Microsoft"],
  ["Designed around real work", "毎日の作業に寄り添う", "Pensado para el trabajo real", "Pensé pour le travail au quotidien", "专为实际工作而设计"],
  ["A better setup starts with the way you use it", "使い方から考える、より良い環境", "Un mejor equipo empieza por cómo lo usas", "Le bon équipement commence par vos usages", "从您的使用需求出发，打造更好的配置"],
  ["Desktop performance", "デスクトップの性能", "Rendimiento de sobremesa", "La puissance d’un PC fixe", "台式机性能"],
  ["Build a system with room to grow", "将来の拡張も見据えた一台を", "Un equipo que crece contigo", "Un PC qui évolue avec vous", "打造可持续升级的电脑"],
  ["Portable workstations", "モバイルワークステーション", "Estaciones de trabajo portátiles", "Stations de travail portables", "移动工作站"],
  ["Take capable hardware beyond the desk", "高性能をデスクの外へ", "Lleva la potencia contigo", "Emportez la performance partout", "让强大性能随您出行"],
  ["Components and learning", "パーツと学び", "Componentes y aprendizaje", "Composants et découverte", "硬件与知识"],
  ["Know what goes inside your machine", "PCの中身を知ろう", "Conoce el interior de tu equipo", "Découvrez l’intérieur de votre PC", "了解电脑内部的硬件"],
  ["Browse by collection", "カテゴリーから探す", "Explorar por categoría", "Explorer par catégorie", "按分类浏览"],
  ["Find the right part of your setup", "あなたの環境に合う商品を", "Encuentra lo que le falta a tu equipo", "Trouvez ce qui complète votre installation", "找到适合您配置的产品"],
  ["Featured picks", "おすすめ商品", "Selección destacada", "Notre sélection", "精选推荐"],
  ["Selected for your next setup", "次の一台におすすめ", "Elegidos para tu próximo equipo", "Sélectionnés pour votre prochain équipement", "为您的下一套装备精选"],
  ["Content Creator", "コンテンツ制作", "Creación de contenido", "Création de contenu", "内容创作"],
  ["PC Building", "自作PC", "Montaje de PC", "Assemblage PC", "电脑组装"],
  ["Most In Stock", "在庫の多い順", "Mayor disponibilidad", "Stock décroissant", "库存最多"],
  ["Complete systems", "完成品PC", "Equipos completos", "Systèmes complets", "整机"],
  ["Parts and desk gear", "パーツ・周辺機器", "Componentes y accesorios", "Composants et accessoires", "硬件与桌面配件"],
  ["Computer component types", "PCパーツの種類", "Tipos de componentes", "Types de composants", "电脑硬件类型"],
  ["Order Summary", "注文内容", "Resumen del pedido", "Récapitulatif", "订单摘要"],
  ["Delivery fees are shown at checkout before you confirm.", "配送料は注文確定前のお会計画面で表示されます。", "Verás los gastos de envío antes de confirmar.", "Les frais de livraison sont indiqués avant confirmation.", "确认订单前，结账页面会显示运费。"],
  ["Continue to Delivery", "配送先の入力へ", "Continuar al envío", "Continuer vers la livraison", "继续填写配送信息"],
  ["Clear Cart", "カートを空にする", "Vaciar carrito", "Vider le panier", "清空购物车"],
  ["Delivery and payment", "配送とお支払い", "Envío y pago", "Livraison et paiement", "配送与付款"],
  ["Contact information", "連絡先情報", "Datos de contacto", "Coordonnées", "联系信息"],
  ["Mobile number", "携帯電話番号", "Número de móvil", "Numéro de mobile", "手机号码"],
  ["Use a saved address", "保存済み住所を使う", "Usar una dirección guardada", "Utiliser une adresse enregistrée", "使用已保存的地址"],
  ["Enter a new address", "新しい住所を入力", "Introducir nueva dirección", "Saisir une nouvelle adresse", "输入新地址"],
  ["Manage address book →", "アドレス帳を管理 →", "Gestionar direcciones →", "Gérer les adresses →", "管理地址簿 →"],
  ["Optional", "任意", "Opcional", "Facultatif", "选填"],
  ["None", "なし", "Ninguno", "Aucun", "无"],
  ["Country or region", "国・地域", "País o región", "Pays ou région", "国家或地区"],
  ["House number, street name, and subdivision", "番地・通り・地区", "Número, calle y urbanización", "Numéro, rue et lotissement", "门牌号、街道及小区"],
  ["House number, street, and subdivision", "番地・通り・地区", "Número, calle y urbanización", "Numéro, rue et lotissement", "门牌号、街道及小区"],
  ["Apartment, suite, building, or floor", "部屋番号・建物名・階", "Apartamento, edificio o planta", "Appartement, bâtiment ou étage", "公寓、楼栋或楼层"],
  ["Province / Region", "州・地域", "Provincia / región", "Province / région", "省份／地区"],
  ["Select province or region", "州・地域を選択", "Selecciona provincia o región", "Choisir une province ou région", "选择省份或地区"],
  ["Select province first", "先に州を選択", "Selecciona primero la provincia", "Choisir d’abord la province", "请先选择省份"],
  ["Select city first", "先に市を選択", "Selecciona primero la ciudad", "Choisir d’abord la ville", "请先选择城市"],
  ["Delivery service", "配送サービス", "Servicio de envío", "Service de livraison", "配送服务"],
  ["Nearby landmark", "近くの目印", "Punto de referencia", "Point de repère", "附近地标"],
  ["Delivery instructions", "配送に関する連絡事項", "Instrucciones de entrega", "Instructions de livraison", "配送说明"],
  ["Complete a sample checkout and follow its delivery timeline on this device. No payment is charged and no courier shipment is created.", "この端末でサンプル注文と配送の流れを確認できます。料金の請求や実際の配送は行われません。", "Completa un pedido de prueba y sigue su estado en este dispositivo. No se cobra ningún pago ni se crea un envío real.", "Passez une commande d’essai et suivez son parcours sur cet appareil. Aucun paiement n’est prélevé et aucun envoi réel n’est créé.", "在此设备完成示例结账并查看配送时间线。不会收取款项，也不会创建实际快递订单。"],
  ["Sample delivery fees. No courier is booked and no arrival date is guaranteed.", "配送料はサンプルです。配送手配や到着日の保証はありません。", "Tarifas de envío de prueba. No se reserva mensajería ni se garantiza una fecha de llegada.", "Frais de livraison d’essai. Aucun transporteur n’est réservé ni aucune date garantie.", "运费为示例。不会预约快递，也不保证送达日期。"],
  ["PC and Laptop Store", "PC・ノートPCストア", "Tienda de ordenadores y portátiles", "Boutique de PC et portables", "电脑与笔记本商店"],
  ["Processor", "プロセッサー", "Procesador", "Processeur", "处理器"],
  ["Graphics", "グラフィックス", "Gráficos", "Graphismes", "显卡"],
  ["Memory", "メモリー", "Memoria", "Mémoire", "内存"],
  ["Motherboard", "マザーボード", "Placa base", "Carte mère", "主板"],
  ["Power", "電源", "Alimentación", "Alimentation", "电源"],
  ["Choose parts", "パーツを選択", "Elige componentes", "Choisir les composants", "选择硬件"],
  ["Your build", "選択した構成", "Tu configuración", "Votre configuration", "您的配置"],
  ["Add Build to Cart", "構成をカートに追加", "Añadir equipo al carrito", "Ajouter le PC au panier", "将配置加入购物车"],
  ["Study and Office", "学習・オフィス", "Estudio y oficina", "Études et bureautique", "学习与办公"],
  ["RGB Gaming", "RGBゲーミング", "Juegos RGB", "Gaming RGB", "RGB 游戏"],
  ["Creator and Editing", "制作・編集", "Creación y edición", "Création et montage", "创作与剪辑"],
  ["Account Access", "アカウント", "Acceso a tu cuenta", "Accès au compte", "账户登录"],
  ["Keep your PC picks in one place.", "気になるPCを一か所に。", "Tus equipos favoritos, en un solo lugar.", "Vos choix PC, au même endroit.", "将心仪电脑收藏在一处。"],
  ["Remember my email", "メールアドレスを記憶", "Recordar mi correo", "Mémoriser mon e-mail", "记住我的邮箱"],
  ["Show password", "パスワードを表示", "Mostrar contraseña", "Afficher le mot de passe", "显示密码"],
  ["Hide password", "パスワードを隠す", "Ocultar contraseña", "Masquer le mot de passe", "隐藏密码"],
  ["You are signed in", "ログイン済みです", "Has iniciado sesión", "Vous êtes connecté", "您已登录"],
  ["Open my account", "アカウントを開く", "Abrir mi cuenta", "Ouvrir mon compte", "打开我的账户"],
  ["Sign in / Create an account", "ログイン・新規登録", "Iniciar sesión / Crear cuenta", "Connexion / Inscription", "登录／注册"],
  ["Welcome back,", "おかえりなさい、", "Bienvenido de nuevo,", "Bon retour,", "欢迎回来，"],
  ["Purchase history", "購入履歴", "Historial de compras", "Historique des achats", "购买记录"],
  ["All orders", "すべての注文", "Todos los pedidos", "Toutes les commandes", "全部订单"],
  ["Display name", "表示名", "Nombre visible", "Nom affiché", "显示名称"],
  ["Recent delivery addresses", "最近の配送先", "Direcciones recientes", "Adresses récentes", "最近收货地址"],
  ["Search products or order number", "商品・注文番号を検索", "Buscar producto o número de pedido", "Rechercher un produit ou numéro de commande", "搜索商品或订单号"],
  ["Online Store Support", "オンラインストアサポート", "Ayuda de la tienda", "Assistance boutique", "网店客服"],
  ["Delivery, product advice, and checkout help", "配送・商品選び・お会計のご相談", "Ayuda con envíos, productos y pagos", "Aide pour la livraison, les produits et le paiement", "配送、选购与结账帮助"],
  ["Philippines-wide service", "フィリピン全土に対応", "Servicio en Filipinas", "Service aux Philippines", "服务覆盖菲律宾"],
  ["No products match your search. Try a brand name or reset the filters.", "該当する商品がありません。ブランド名で検索するか、絞り込みをリセットしてください。", "No hay coincidencias. Prueba una marca o restablece los filtros.", "Aucun produit ne correspond. Essayez une marque ou réinitialisez les filtres.", "没有匹配商品。请尝试品牌名称或重置筛选。"]
];

function storeText(english) {
  const language = storeLanguage();
  if (language === "en") return english;
  const column = { ja: 1, es: 2, fr: 3, zh: 4 }[language];
  const key = english.trim().replace(/\s+/g, " ").toLowerCase();
  const row = storeTranslations.find(item => item[0].toLowerCase() === key);
  if (row) return row[column];
  const stock = key.match(/^(\d+) in stock$/);
  if (stock) return ["", `在庫 ${stock[1]} 点`, `${stock[1]} disponibles`, `${stock[1]} en stock`, `库存 ${stock[1]} 件`][column];
  const saving = key.match(/^save (\d+)%$/);
  if (saving) return ["", `${saving[1]}% OFF`, `Ahorra ${saving[1]}%`, `Économisez ${saving[1]} %`, `节省 ${saving[1]}%`][column];
  const greeting = english.trim().match(/^Hi, (.+)$/);
  if (greeting) return ["", `こんにちは、${greeting[1]}`, `Hola, ${greeting[1]}`, `Bonjour, ${greeting[1]}`, `您好，${greeting[1]}`][column];
  const results = key.match(/^(\d+) products? found$/);
  if (results) return ["", `${results[1]} 件の商品`, `${results[1]} productos encontrados`, `${results[1]} produits trouvés`, `找到 ${results[1]} 件商品`][column];
  const cart = key.match(/^cart, (\d+) items?$/);
  if (cart) return ["", `カート、${cart[1]} 点`, `Carrito, ${cart[1]} artículos`, `Panier, ${cart[1]} articles`, `购物车，${cart[1]} 件商品`][column];
  return english;
}

function translateStoreInterface() {
  document.documentElement.lang = storeLanguages[storeLanguage()].html;
  if (storeLanguage() === "en") return;
  const excluded = "script, style, textarea, code, pre, [translate='no'], #languageSelect, #currencySelect, .product-name-button, .product-specs, #profileName, #profileEmail, #profileGreeting, #profileAvatar, #trackingRecipient, #trackingAddress, #trackingContact, .support-draft p";

  function translateElement(element) {
    if (element.closest(excluded)) return;
    // Translating an implicit option value would break existing English filter keys.
    if (element.tagName === "OPTION" && !element.hasAttribute("value")) element.value = element.textContent;
    for (const attribute of ["placeholder", "title", "aria-label", "label"]) {
      if (!element.hasAttribute(attribute)) continue;
      const original = element.getAttribute(attribute);
      const translated = storeText(original);
      if (translated !== original) element.setAttribute(attribute, translated);
    }
  }

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest(excluded)) return;
      const original = node.nodeValue;
      const translated = storeText(original);
      if (translated !== original) node.nodeValue = original.replace(original.trim(), translated);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.closest(excluded)) return;
      translateElement(node);
      [...node.childNodes].forEach(translateNode);
    }
  }

  document.title = document.title.split(" | ").map(storeText).join(" | ");
  translateNode(document.body);
  // New product cards, dialogs and account panels use the same translations.
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "childList") record.addedNodes.forEach(translateNode);
      if (record.type === "characterData") translateNode(record.target);
      if (record.type === "attributes") translateElement(record.target);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label", "label"] });
}

document.addEventListener("DOMContentLoaded", translateStoreInterface);
