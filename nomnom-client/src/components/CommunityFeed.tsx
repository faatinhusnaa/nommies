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

const SATIRICAL_TICKER = [
  { user: 'Cinna', text: 'acquired 40% of the Moon to establish cloud dairy farms.', tag: 'TAKEOVER', icon: '☁️' },
  { user: 'Pompompurin', text: 'declared personal bankruptcy after cornering the custard market.', tag: 'CRISIS', icon: '🍮' },
  { user: 'Kuromi', text: 'launched a hostile leveraged buyout of Hello Kitty Apple Orchards.', tag: 'MERGER', icon: '😈' },
  { user: 'Keroppi', text: 'announced +420% dividend yield paid exclusively in pond flies.', tag: 'DIVIDEND', icon: '🐸' },
];

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Replies State
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState<{ [postId: number]: string }>({});

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

    // Optimistic UI Update
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
      loadFeed(); // Rollback on error
    }
  };

  // Submit Reply to Post
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

      {/* Satirical Wire Bar */}
      <div className="bg-[#fff8fa] border border-[#f9d7df] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] bg-[#a11635] text-white font-extrabold px-2 py-0.5 rounded-full">
            FLASH NEWS
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            Live Sanrio Empire Broadcast
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {SATIRICAL_TICKER.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white rounded-xl flex items-center gap-2.5 border border-[#fce7ed] text-xs"
            >
              <span className="text-lg">{item.icon}</span>
              <div className="truncate text-gray-700">
                <span className="font-bold text-[#a11635]">{item.user}: </span>
                {item.text}
              </div>
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
                    {/* Existing Replies List */}
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
    </section>
  );
};