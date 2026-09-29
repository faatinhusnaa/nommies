import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { socket } from '../services/socket';

interface ReplyItem {
  id: number;
  content: string;
  user?: { id: number; name: string };
  createdAt?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  votes: number;
  user?: { id: number; name: string };
  userId?: number;
  replies?: ReplyItem[];
}

interface FlashStory {
  id: string;
  user: string;
  text: string;
  tag: string;
  icon: string;
  fullStory: string;
  timestamp: string;
  likes: number;
  reposts: number;
  comments: { id: string; author: string; text: string; time: string }[];
}

const SATIRICAL_TICKER: FlashStory[] = [
  {
    id: 'cinna-moon',
    user: 'Cinna',
    text: 'acquired 40% of the Moon to establish cloud dairy farms.',
    tag: 'TAKEOVER',
    icon: '☁️',
    fullStory:
      'In an unprecedented hostile takeover of extraterrestrial dairy assets, Cinnamoroll Holdings acquired a controlling 40% stake in the Mare Tranquillitatis basin. The facility is set to churn zero-gravity whipped cream and high-altitude condensed milk, fundamentally destabilizing regional pastry margins on Earth.',
    timestamp: '12m ago',
    likes: 42,
    reposts: 9,
    comments: [
      { id: 'c1', author: 'Pompompurin', text: 'Where can I subscribe to the space custard futures?', time: '8m ago' },
      { id: 'c2', author: 'Kuromi', text: 'Watch your borders. Mischief syndicate scouts are already deployed.', time: '4m ago' },
    ],
  },
  {
    id: 'purin-bankrupt',
    user: 'Pompompurin',
    text: 'declared personal bankruptcy after cornering the custard market.',
    tag: 'CRISIS',
    icon: '🍮',
    fullStory:
      'Pompompurin has filed for Chapter 11 Pudding Protection after attempting to corner 85% of worldwide caramel futures. The market plummeted 18% following an unexpected gelatin surplus, leaving billions in unsold custard reserves in chilled Tokyo vaults.',
    timestamp: '24m ago',
    likes: 89,
    reposts: 31,
    comments: [
      { id: 'c3', author: 'Hello Kitty', text: 'Sending financial relief baskets of red ribbon cookies ❤️', time: '18m ago' },
    ],
  },
  {
    id: 'kuromi-buyout',
    user: 'Kuromi',
    text: 'launched a hostile leveraged buyout of Hello Kitty Apple Orchards.',
    tag: 'MERGER',
    icon: '😈',
    fullStory:
      'In a dramatic late-night filing with the Snack Regulatory Commission, Kuromi unveiled an unsolicited 65-billion-berry tender offer for Hello Kitty’s flagship bakery consortium. Wall Street pastry analysts cite heavy short positions across all pastel ribbon bonds.',
    timestamp: '1h ago',
    likes: 120,
    reposts: 58,
    comments: [
      { id: 'c4', author: 'My Melody', text: 'Let us discuss this over lavender tea first please 🌸', time: '45m ago' },
      { id: 'c5', author: 'Kuromi', text: 'No settlements. Only empire expansion.', time: '30m ago' },
    ],
  },
  {
    id: 'keroppi-yield',
    user: 'Keroppi',
    text: 'announced +420% dividend yield paid exclusively in pond flies.',
    tag: 'DIVIDEND',
    icon: '🐸',
    fullStory:
      'Donut Pond Capital has declared an eye-popping +420% annualized dividend yield for Q3. Payouts will not be settled in fiat currency, but distributed exclusively in fresh crispy pond crickets, lotus root chips, and sparkling matcha soda casks.',
    timestamp: '2h ago',
    likes: 77,
    reposts: 14,
    comments: [
      { id: 'c6', author: 'Cinna', text: 'Do the pond lotus chips pair well with whipped dairy?', time: '1h ago' },
    ],
  },
];

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Replies State for live feed posts
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState<{ [postId: number]: string }>({});

  // Flash News Interactive Modal State
  const [tickerStories, setTickerStories] = useState<FlashStory[]>(SATIRICAL_TICKER);
  const [activeStory, setActiveStory] = useState<FlashStory | null>(null);
  const [storyCommentInput, setStoryCommentInput] = useState('');
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});
  const [userRepostMap, setUserRepostMap] = useState<Record<string, boolean>>({});

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user_profile');
      return raw ? JSON.parse(raw) : { name: 'Executive Tycoon' };
    } catch {
      return { name: 'Executive Tycoon' };
    }
  })();

  const loadFeed = async () => {
    try {
      const data = await apiRequest('/posts');
      const list = Array.isArray(data) ? data : data.data || [];
      setPosts(list);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onNewPost(newPost: Post) {
      setPosts((prev) => [newPost, ...prev]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('post:created', onNewPost);

    loadFeed();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('post:created', onNewPost);
      socket.disconnect();
    };
  }, []);

  // Handle Post Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setStatus('Publishing to NomNom Wire...');

    try {
      await apiRequest('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      setTitle('');
      setContent('');
      setStatus('Dispatched to Tycoons! ✨');
      setTimeout(() => setStatus(''), 2500);
      loadFeed();
    } catch (err: any) {
      setStatus(err.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  // Handle Upvote / Downvote
  const handleVote = async (postId: number, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? 1 : -1;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, votes: (p.votes || 0) + delta } : p
      )
    );

    try {
      await apiRequest(`/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
    } catch (err) {
      console.error('Failed to register vote:', err);
      loadFeed();
    }
  };

  // Submit Reply to Live Post
  const handleSubmitReply = async (postId: number) => {
    const text = replyInput[postId]?.trim();
    if (!text) return;

    try {
      await apiRequest(`/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      setReplyInput((prev) => ({ ...prev, [postId]: '' }));
      loadFeed();
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  // Flash News Interactive Handlers
  const handleToggleStoryLike = (storyId: string) => {
    const hasLiked = !!userLikedMap[storyId];
    setUserLikedMap((prev) => ({ ...prev, [storyId]: !hasLiked }));

    const updated = tickerStories.map((s) =>
      s.id === storyId ? { ...s, likes: s.likes + (hasLiked ? -1 : 1) } : s
    );
    setTickerStories(updated);

    if (activeStory && activeStory.id === storyId) {
      setActiveStory((prev) =>
        prev ? { ...prev, likes: prev.likes + (hasLiked ? -1 : 1) } : null
      );
    }
  };

  const handleToggleStoryRepost = (storyId: string) => {
    const hasReposted = !!userRepostMap[storyId];
    setUserRepostMap((prev) => ({ ...prev, [storyId]: !hasReposted }));

    const updated = tickerStories.map((s) =>
      s.id === storyId ? { ...s, reposts: s.reposts + (hasReposted ? -1 : 1) } : s
    );
    setTickerStories(updated);

    if (activeStory && activeStory.id === storyId) {
      setActiveStory((prev) =>
        prev ? { ...prev, reposts: prev.reposts + (hasReposted ? -1 : 1) } : null
      );
    }
  };

  const handleAddStoryComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyCommentInput.trim() || !activeStory) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      author: currentUser.name || 'Executive Tycoon',
      text: storyCommentInput.trim(),
      time: 'Just now',
    };

    const updatedComments = [...activeStory.comments, newComment];

    setTickerStories((prev) =>
      prev.map((s) => (s.id === activeStory.id ? { ...s, comments: updatedComments } : s))
    );
    setActiveStory((prev) => (prev ? { ...prev, comments: updatedComments } : null));
    setStoryCommentInput('');
  };

  return (
    <section className="bg-white/95 backdrop-blur rounded-3xl p-6 sm:p-8 border border-[#f8d7df] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#a11635] flex items-center gap-2">
            <span>🍰</span> NomNom Wire & Community Feed
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Broadcast treat acquisitions and monitor member portfolio maneuvers
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 ${
            isConnected
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          ></span>
          {isConnected ? 'Market Open' : 'Connecting...'}
        </span>
      </div>

      {/* Satirical Wire Bar with Clickable Cards */}
      <div className="bg-[#fff8fa] border border-[#f9d7df] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] bg-[#a11635] text-white font-extrabold px-2 py-0.5 rounded-full">
            FLASH NEWS
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            Live Sanrio Empire Broadcast
          </span>
          <span className="text-[10px] text-gray-400 italic hidden sm:inline">
            (Click any wire to inspect full dossier)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {tickerStories.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveStory(item)}
              className="p-2.5 bg-white hover:bg-[#fff0f4] rounded-xl flex items-center justify-between gap-2.5 border border-[#fce7ed] hover:border-[#a11635] text-xs cursor-pointer transition group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="truncate text-gray-700">
                  <span className="font-bold text-[#a11635]">{item.user}: </span>
                  {item.text}
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#a11635] opacity-0 group-hover:opacity-100 transition shrink-0">
                Read →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-[#f8d7df] rounded-2xl p-5 space-y-3 bg-[#fffcfd]"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline (e.g. Cornered the matcha market...)"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[#f8d7df] text-xs focus:outline-none focus:ring-1 focus:ring-[#a11635] bg-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Detail your snack strategy, hostile takeover, or recipe..."
          required
          className="w-full px-4 py-2.5 rounded-xl border border-[#f8d7df] text-xs focus:outline-none focus:ring-1 focus:ring-[#a11635] bg-white resize-none"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-semibold text-[#a11635]">{status}</span>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#a11635] hover:bg-[#850f29] text-white px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loading ? 'Transmitting...' : 'Dispatch to Wire'}
          </button>
        </div>
      </form>

      {/* Member Posts Stream */}
      <div>
        <h3 className="text-xs font-bold text-gray-800 mb-3">Live Dispatches</h3>
        <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
          {posts.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">
              No dispatches logged. Issue the first bulletin!
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#fffcfd] border border-[#f8d7df] rounded-2xl p-4 transition hover:shadow-xs space-y-2.5"
              >
                {/* Header: Title + Author Tag */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{post.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      {post.content}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#a11635] bg-[#ffeef2] px-2.5 py-0.5 rounded-full border border-[#f8d7df] shrink-0">
                    @{post.user?.name || `Executive #${post.userId || '?'}`}
                  </span>
                </div>

                {/* Actions Bar: Voting + Reply Toggle */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#fff0f3] text-xs">
                  {/* Upvote / Downvote Pill */}
                  <div className="flex items-center bg-[#fff5f7] border border-[#fcd5de] rounded-xl px-2 py-0.5 gap-1.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'up')}
                      className="text-gray-400 hover:text-[#a11635] hover:scale-110 active:scale-95 transition font-black cursor-pointer text-xs"
                      title="Upvote"
                    >
                      ▲
                    </button>
                    <span className="font-extrabold text-xs text-[#a11635] px-1">
                      {post.votes || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'down')}
                      className="text-gray-400 hover:text-[#a11635] hover:scale-110 active:scale-95 transition font-black cursor-pointer text-xs"
                      title="Downvote"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Reply Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveReplyId(activeReplyId === post.id ? null : post.id)
                    }
                    className="text-xs font-bold text-gray-500 hover:text-[#a11635] flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <span>💬</span> {post.replies?.length || 0} Replies
                  </button>
                </div>

                {/* Expandable Replies Drawer */}
                {activeReplyId === post.id && (
                  <div className="pt-2 pl-3 border-l-2 border-[#fcd5de] space-y-2">
                    {post.replies && post.replies.length > 0 ? (
                      post.replies.map((r) => (
                        <div
                          key={r.id}
                          className="bg-white p-2.5 rounded-xl border border-[#fae2e7] text-xs shadow-2xs"
                        >
                          <span className="font-extrabold text-[#a11635] text-[10px] block mb-0.5">
                            @{r.user?.name || 'anonymous'}
                          </span>
                          <p className="text-gray-700">{r.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-400 italic py-1">
                        No replies yet. Be the first to advise!
                      </p>
                    )}

                    {/* Reply Input Form */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a diplomatic syndicate response..."
                        value={replyInput[post.id] || ''}
                        onChange={(e) =>
                          setReplyInput((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleSubmitReply(post.id)
                        }
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#edd1d8] bg-white focus:ring-1 focus:ring-[#a11635] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(post.id)}
                        className="px-3.5 py-1.5 bg-[#a11635] text-white font-bold text-xs rounded-xl hover:bg-[#850f29] transition cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Flash News Dossier Modal */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-[#f9d7df] shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f3] border border-[#f7cfd8] flex items-center justify-center text-2xl">
                  {activeStory.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    {activeStory.user}
                    <span className="text-[10px] text-gray-400 font-medium">· {activeStory.timestamp}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#a11635] bg-[#fff0f4] px-2 py-0.5 rounded-full border border-[#fad2db]">
                    {activeStory.tag} BULLETIN
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Story Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-[#fffcfd] p-3.5 rounded-2xl border border-gray-100">
                {activeStory.fullStory}
              </p>

              {/* Action Buttons: Like & Repost */}
              <div className="flex items-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() => handleToggleStoryLike(activeStory.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    userLikedMap[activeStory.id]
                      ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{userLikedMap[activeStory.id] ? '❤️' : '🤍'}</span>
                  <span>{activeStory.likes} Likes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStoryRepost(activeStory.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    userRepostMap[activeStory.id]
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>🔄</span>
                  <span>{activeStory.reposts} Reposts</span>
                </button>
              </div>

              {/* Discussion / Comments Section */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h5 className="text-xs font-black text-gray-800 flex items-center gap-1">
                  <span>💬</span> Syndicate Discussion ({activeStory.comments.length})
                </h5>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeStory.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-xs space-y-0.5"
                    >
                      <div className="flex justify-between items-center">
                        <strong className="text-gray-900 font-bold">{comm.author}</strong>
                        <span className="text-[10px] text-gray-400">{comm.time}</span>
                      </div>
                      <p className="text-gray-600">{comm.text}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddStoryComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={storyCommentInput}
                    onChange={(e) => setStoryCommentInput(e.target.value)}
                    placeholder="Dispatch an executive insight or reply..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition cursor-pointer"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
              >
                Close Wire
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};