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
