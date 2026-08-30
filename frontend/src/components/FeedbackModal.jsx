import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  ShieldCheck, 
  ThumbsUp,
  Scale,
  Camera,
  Lightbulb,
  Bug
} from 'lucide-react';

export const FeedbackModal = () => {
  const { isFeedbackModalOpen, setIsFeedbackModalOpen, user, addNotification } = useAuth();

  const [category, setCategory] = useState('vision_ocr');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isFeedbackModalOpen) return null;

  const categories = [
    { id: 'vision_ocr', label: 'AI Vision & OCR Scanner', icon: Camera, color: 'text-sky-600 dark:text-sky-400' },
    { id: 'rule_accuracy', label: 'LMPC 2011 Rule Accuracy', icon: Scale, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'feature_request', label: 'Feature Request / Idea', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'bug_report', label: 'Bug / UI Glitch', icon: Bug, color: 'text-rose-500' },
    { id: 'general', label: 'General Experience', icon: ThumbsUp, color: 'text-emerald-500' }
  ];

  const ratingLabels = {
    1: '1 Star - Needs Improvement',
    2: '2 Stars - Fair',
    3: '3 Stars - Good & Functional',
    4: '4 Stars - Very Satisfied',
    5: '5 Stars - Outstanding & Accurate'
  };

  const handleClose = () => {
    setIsFeedbackModalOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setErrorMsg('');
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please describe your feedback or observation.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const newFeedback = {
        id: 'fb-' + Date.now(),
        timestamp: new Date().toISOString(),
        category,
        rating,
        subject: subject.trim() || 'General Feedback',
        message: message.trim(),
        user_name: anonymous ? 'Anonymous Contributor' : (user?.full_name || 'Guest User'),
        user_role: anonymous ? 'anonymous' : (user?.role || 'guest'),
        user_jurisdiction: user?.jurisdiction || 'Pan-India',
        email: email.trim()
      };

      // Store in localStorage for permanent record
      const existing = JSON.parse(localStorage.getItem('app_user_feedback') || '[]');
      existing.unshift(newFeedback);
      localStorage.setItem('app_user_feedback', JSON.stringify(existing.slice(0, 50)));

      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Feedback Received',
          message: `Thank you! Your feedback on '${newFeedback.category}' has been logged to the statutory quality registry.`,
          targetRole: [user?.role || 'all'],
          category: 'feedback_ack',
          sender: 'DoCA Quality Assurance Team'
        });
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Feedback save error:', err);
      setErrorMsg('Failed to save feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Top Gradient Ribbon */}
        <div className="h-2.5 w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-amber-400 border border-sky-200 dark:border-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-500" />
                  Public & Officer Feedback Channel
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
                Platform Feedback & Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Help us refine PackSureAI for nationwide statutory enforcement & consumer transparency.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-sky-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Feedback Successfully Logged!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Your inputs have been recorded in the platform statutory quality ledger. Thank you for contributing to better metrology enforcement.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:opacity-95"
                >
                  Done & Return to Workspace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Identity Banner */}
              <div className="p-3 bg-sky-50/70 dark:bg-slate-950/70 border border-sky-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600 dark:text-amber-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Posting as: <b>{anonymous ? 'Anonymous' : (user?.full_name || 'Guest / Visitor')}</b>
                    {!anonymous && user?.role_title && (
                      <span className="text-slate-400 ml-1">({user.role_title})</span>
                    )}
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Post Anonymously</span>
                </label>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Feedback Topic:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-slate-800 border-sky-500 dark:border-amber-400 font-bold shadow-2xs ring-1 ring-current'
                            : 'border-sky-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-50/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div className="p-3 bg-white dark:bg-slate-950 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Overall Experience Rating:
                  </label>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. OCR accuracy on cylindrical snack packaging..."
                  className="w-full px-3 py-2 bg-sky-50/40 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Feedback / Observation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your suggestion, encountered bug, or thoughts on compliance features..."
                  className="w-full px-3 py-2 bg-sky-50/40 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contact Email (Optional for follow-up)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@doca.gov.in"
                    className="w-full pl-8 pr-3 py-2 bg-sky-50/40 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600 hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-sky-50/60 dark:bg-slate-950/60 border-t border-sky-100 dark:border-slate-800 text-center text-[10px] text-slate-500">
          PackSureAI Quality Assurance • Department of Consumer Affairs • SIH26034
        </div>
      </div>
    </div>
  );
};
