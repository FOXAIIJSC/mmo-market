export type ApiCategory = {
  slug: string;
  name: string;
  short: string;
  iconKey: string;
  description: string;
  color: string;
  productCount: number;
};

export type ApiSellerSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  totalSold: number;
  badge?: string | null;
  kycStatus: string;
};

export type ApiProductListItem = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  price: number;
  comparePrice?: number | null;
  delivery: "Auto" | "Manual" | "Hybrid";
  warrantyDays: number;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  thumbnailColor: string;
  thumbnailIcon?: string | null;
  badges: string[];
  seller: ApiSellerSummary;
};

export type ApiProductDetail = ApiProductListItem & {
  description: string;
  features: string[];
  policies: string[];
  faq: { q: string; a: string }[];
  reviews: ApiReview[];
};

export type ApiReview = {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string | null;
};

export type ApiProductListResponse = {
  items: ApiProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  walletBalance: number;
  loyaltyPoints: number;
  kycStatus: string;
  avatarColor: string;
};

export type ApiAuthResponse = {
  accessToken: string;
  user: ApiUser;
};

export type ApiCartLine = {
  cartItemId: string;
  product: ApiProductListItem;
  quantity: number;
  subtotal: number;
};

export type ApiCart = {
  lines: ApiCartLine[];
  subtotal: number;
  totalItems: number;
};

export type ApiOrderLine = {
  id: string;
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  delivery: string;
  deliveredItems?: string[] | null;
};

export type ApiOrder = {
  id: string;
  code: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  fee: number;
  total: number;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  escrowReleaseAt?: string | null;
  completedAt?: string | null;
  lines: ApiOrderLine[];
};

export type ApiWalletTxn = {
  id: string;
  type: string;
  status: string;
  amount: number;
  note: string;
  createdAt: string;
};

export type ApiWalletState = {
  balance: number;
  heldBalance: number;
  loyaltyPoints: number;
  transactions: ApiWalletTxn[];
};

export type ApiSellerProduct = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  price: number;
  comparePrice?: number | null;
  delivery: string;
  warrantyDays: number;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  thumbnailColor: string;
  thumbnailIcon?: string | null;
  status: string;
  description: string;
  inventoryAvailable: number;
  inventoryReserved: number;
  inventorySold: number;
};

export type ApiSellerOrderLine = {
  orderId: string;
  orderLineId: string;
  orderCode: string;
  status: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  delivery: string;
  buyerDisplayName: string;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  deliveredItems?: string[] | null;
};

export type ApiSellerInventoryItem = {
  id: string;
  preview: string;
  reserved: boolean;
  sold: boolean;
  orderId?: string | null;
  createdAt: string;
};

export type ApiSellerInventoryView = {
  productId: string;
  productSlug: string;
  productTitle: string;
  available: number;
  reserved: number;
  soldCount: number;
  items: ApiSellerInventoryItem[];
};

export type ApiSellerWithdraw = {
  id: string;
  amount: number;
  method: string;
  account: string;
  status: string;
  note?: string | null;
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

export type ApiSellerDashboard = {
  revenue30d: number;
  orders30d: number;
  productsActive: number;
  productsPending: number;
  ordersAwaitingDelivery: number;
  openDisputes: number;
  pendingWithdrawals: number;
  availableBalance: number;
};

export type ApiAdminUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  walletBalance: number;
  loyaltyPoints: number;
  kycStatus: string;
  createdAt: string;
};

export type ApiAdminProduct = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  status: string;
  sellerUsername: string;
  createdAt: string;
};

export type ApiAdminWithdraw = {
  id: string;
  sellerUserId: string;
  sellerUsername: string;
  amount: number;
  method: string;
  account: string;
  status: string;
  note?: string | null;
  adminNote?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

export type ApiAdminMetrics = {
  gmv: number;
  revenue: number;
  ordersCompleted: number;
  newUsers: number;
  kycPending: number;
  productsPending: number;
  openDisputes: number;
  pendingWithdrawals: number;
};

export type ApiKycSubmission = {
  id: string;
  status: string;
  fullName: string;
  idNumber: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  rejectionReason?: string | null;
};

export type ApiDisputeMessage = {
  id: string;
  authorUserId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

export type ApiDisputeListItem = {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  title: string;
  status: string;
  createdAt: string;
  slaUntil: string;
  resolution?: string | null;
};

export type ApiDisputeDetail = {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  buyerId: string;
  sellerId: string;
  title: string;
  body: string;
  status: string;
  resolution?: string | null;
  slaUntil: string;
  createdAt: string;
  messages: ApiDisputeMessage[];
};

export type ApiOwnReview = {
  id: string;
  productId: string;
  productTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply?: string | null;
};

export type ApiAdminWalletUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  walletBalance: number;
  loyaltyPoints: number;
  txnCount: number;
  createdAt: string;
};

export type ApiAdminWalletOverview = {
  totalBalance: number;
  totalUsers: number;
  totalTopup: number;
  totalSpent: number;
  pendingTopups: number;
};

export type ApiAdminWalletTxn = {
  id: string;
  type: string;
  status: string;
  amount: number;
  note: string;
  createdAt: string;
};
