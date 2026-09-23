import {
  AlignLeft, Archive, Award, Book, BookOpen, Briefcase, Calendar, Clipboard,
  Clock, Edit3, File, FileMinus, FileText, FlaskConical, GraduationCap, Grid,
  HelpCircle, Landmark, Layers, List, Mail, Megaphone, MessageCircle,
  MessageSquare, Microscope, Search, Send, Sparkles, TrendingUp, Volume2,
} from "lucide-react";

const MAP = {
  "mail": Mail, "message-circle": MessageCircle, "file-text": FileText,
  "search": Search, "edit-3": Edit3, "clipboard": Clipboard,
  "trending-up": TrendingUp, "file-minus": FileMinus, "book-open": BookOpen,
  "calendar": Calendar, "message-square": MessageSquare, "help-circle": HelpCircle,
  "layers": Layers, "list": List, "award": Award, "clock": Clock,
  "briefcase": Briefcase, "send": Send, "file": File, "megaphone": Megaphone,
  "book": Book, "volume-2": Volume2, "grid": Grid, "flask": FlaskConical,
  "archive": Archive, "align-left": AlignLeft, "sparkles": Sparkles,
  "landmark": Landmark, "graduation-cap": GraduationCap, "microscope": Microscope,
};

export default function Icon({ name, size = 20, ...props }) {
  const Cmp = MAP[name] || Sparkles;
  return <Cmp size={size} {...props} />;
}
