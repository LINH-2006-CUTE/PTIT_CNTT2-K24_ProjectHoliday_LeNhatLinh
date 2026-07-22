import React from 'react';
import {
  Home,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  Heart,
  Star,
  User,
  Crown,
  Lock,
  ShieldCheck,
  LogOut,
  MapPin,
  Phone,
  Bell,
  Trash2,
  Edit,
  Check,
  Sparkles,
  Search,
  Receipt,
  Clock,
  CreditCard,
  ChefHat,
  Filter,
  ArrowRight,
  Plus,
  Minus,
  X
} from 'lucide-react';

export const IconHome = ({ className = "w-5 h-5", ...props }) => (
  <Home className={className} {...props} />
);

export const IconMenu = ({ className = "w-5 h-5", ...props }) => (
  <UtensilsCrossed className={className} {...props} />
);

export const IconUtensils = ({ className = "w-5 h-5", ...props }) => (
  <UtensilsCrossed className={className} {...props} />
);

export const IconCalendar = ({ className = "w-5 h-5", ...props }) => (
  <Calendar className={className} {...props} />
);

export const IconShoppingBag = ({ className = "w-5 h-5", ...props }) => (
  <ShoppingCart className={className} {...props} />
);

export const IconHeart = ({ className = "w-5 h-5", filled = false, ...props }) => (
  <Heart className={`${className} ${filled ? 'fill-current text-red-500' : ''}`} {...props} />
);

export const IconStar = ({ className = "w-5 h-5", filled = false, ...props }) => (
  <Star className={`${className} ${filled ? 'fill-amber-400 text-amber-400' : ''}`} {...props} />
);

export const IconUser = ({ className = "w-5 h-5", ...props }) => (
  <User className={className} {...props} />
);

export const IconCrown = ({ className = "w-5 h-5", ...props }) => (
  <Crown className={className} {...props} />
);

export const IconLock = ({ className = "w-5 h-5", ...props }) => (
  <Lock className={className} {...props} />
);

export const IconShieldLock = ({ className = "w-5 h-5", ...props }) => (
  <ShieldCheck className={className} {...props} />
);

export const IconLogOut = ({ className = "w-5 h-5", ...props }) => (
  <LogOut className={className} {...props} />
);

export const IconMapPin = ({ className = "w-5 h-5", ...props }) => (
  <MapPin className={className} {...props} />
);

export const IconPhone = ({ className = "w-5 h-5", ...props }) => (
  <Phone className={className} {...props} />
);

export const IconBell = ({ className = "w-5 h-5", ...props }) => (
  <Bell className={className} {...props} />
);

export const IconSearch = ({ className = "w-5 h-5", ...props }) => (
  <Search className={className} {...props} />
);

export const IconReceipt = ({ className = "w-5 h-5", ...props }) => (
  <Receipt className={className} {...props} />
);

export const IconClock = ({ className = "w-5 h-5", ...props }) => (
  <Clock className={className} {...props} />
);

export const IconChef = ({ className = "w-5 h-5", ...props }) => (
  <ChefHat className={className} {...props} />
);

export const IconTrash = ({ className = "w-5 h-5", ...props }) => (
  <Trash2 className={className} {...props} />
);

export const IconEdit = ({ className = "w-5 h-5", ...props }) => (
  <Edit className={className} {...props} />
);

export const IconCheck = ({ className = "w-5 h-5", ...props }) => (
  <Check className={className} {...props} />
);

export const IconSparkles = ({ className = "w-5 h-5", ...props }) => (
  <Sparkles className={className} {...props} />
);

export const IconCreditCard = ({ className = "w-5 h-5", ...props }) => (
  <CreditCard className={className} {...props} />
);
