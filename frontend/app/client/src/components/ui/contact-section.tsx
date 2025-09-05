import { useState } from "react";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Send, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Lang = "ko" | "en";

const T = {
  ko: {
    title: "Get In Touch",
    subtitle: "문의 하실 부분 있으시면 언제든 연락주세요",
    labels: { name: "이름", email: "이메일", subject: "제목", message: "메시지" },
    placeholders: { name: "", email: "email@example.com", subject: "", message: "" },
    contact: { email: "Email", phone: "Phone", location: "Location", city: "서울, 대한민국" },
    follow: "팔로우",
    send: "메시지 보내기",
    sending: "전송 중...",
    toastOkTitle: "메시지 전송 완료",
    toastOkDesc: "메시지가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.",
    toastErrTitle: "전송 실패",
    toastErrDesc: "메시지 전송에 실패했습니다. 다시 시도해 주세요.",
  },
  en: {
    title: "Get In Touch",
    subtitle: "Feel free to reach out anytime.",
    labels: { name: "Name", email: "Email", subject: "Subject", message: "Message" },
    placeholders: { name: "", email: "email@example.com", subject: "", message: "" },
    contact: { email: "Email", phone: "Phone", location: "Location", city: "Seoul, Republic of Korea" },
    follow: "Follow Me",
    send: "Send Message",
    sending: "Sending...",
    toastOkTitle: "Message sent",
    toastOkDesc: "Your message has been sent. I'll get back to you soon.",
    toastErrTitle: "Failed",
    toastErrDesc: "Failed to send the message. Please try again.",
  },
};

export default function ContactSection({ language = "ko" }: { language?: Lang }) {
  const L = T[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/contact", formData);
      toast({
        title: L.toastOkTitle,
        description: L.toastOkDesc,
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: L.toastErrTitle,
        description: L.toastErrDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Github, href: `https://github.com/${import.meta.env.VITE_GITHUB_USERNAME || 'hcho0511'}`, label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "#", label: "Blog" }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{L.title}</h2>
          <p className="text-gray-700 dark:text-slate-300 mb-6">{L.subtitle}</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{L.contact.email}</h3>
                <p className="text-gray-700 dark:text-slate-300">hcho0511@icloud.com</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{L.contact.phone}</h3>
                <p className="text-gray-700 dark:text-slate-300">+82-10-1234-5678</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{L.contact.location}</h3>
                <p className="text-gray-700 dark:text-slate-300">{L.contact.city}</p>
              </div>
            </div>
            
            <div className="pt-6">
              <h3 className="font-semibold mb-4">{L.follow}</h3>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                      aria-label={link.label}
                    >
                      <IconComponent className="h-5 w-5 text-foreground dark:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  {L.labels.name}
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={L.placeholders.name}
                  required
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  {L.labels.email}
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={L.placeholders.email}
                  required
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  {L.labels.subject}
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={L.placeholders.subject}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  {L.labels.message}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={L.placeholders.message}
                  required
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {L.sending}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {L.send}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
