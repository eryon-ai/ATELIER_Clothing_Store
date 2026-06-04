import { useState, useEffect } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { cn } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminSupport() {
  const { 
    supportTickets, resolveTicket, escalateTicket, issueTicketRefund, sendChatMessage, addTicketReply,
    liveChats, kbArticles, faqs, supportAnalytics
  } = useAdminStore()
  
  const [activeTab, setActiveTab] = useState('Inbox & Tickets')
  const [selectedId, setSelectedId] = useState(supportTickets[0]?.id || null)
  const [replyText, setReplyText] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true)

  const selectedTicket = supportTickets.find(t => t.id === selectedId)

  useEffect(() => {
    setReplyText('')
  }, [selectedId])
  
  // Customer issue history (mocked by finding other tickets by this customer)
  const customerHistory = selectedTicket 
    ? supportTickets.filter(t => t.email === selectedTicket.email && t.id !== selectedTicket.id) 
    : []

  const handleResolve = () => {
    if (selectedId) {
      resolveTicket(selectedId)
      toast.success('Ticket marked as resolved')
    }
  }

  const handleEscalate = () => {
    if (selectedId) {
      escalateTicket(selectedId)
      toast.error('Ticket Escalated to Tier 2', { icon: '🔥' })
    }
  }

  const handleRefund = () => {
    if (selectedId) {
      if (window.confirm('Process a full refund for this customer issue?')) {
        issueTicketRefund(selectedId)
        toast.success('Refund processed & ticket closed')
      }
    }
  }

  const handleSendChat = () => {
    if(!chatReply.trim()) return;
    
    // 1. Send Agent Message
    const currentChatId = liveChats[0].id;
    sendChatMessage(currentChatId, chatReply, 'Agent')
    setChatReply('')
    
    // 2. Simulate Auto Reply
    if (autoReplyEnabled) {
      setTimeout(() => {
        sendChatMessage(currentChatId, "Thanks for the info! Let me check on that.", 'Customer')
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Customer Support Center</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Manage tickets, live chats, knowledge base, and agent performance</p>
        </div>
        <div className="flex gap-3">
          <button className="text-on-surface-variant hover:text-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">help</span>
            Support Docs
          </button>
        </div>
      </div>

      <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest overflow-x-auto">
        {['Inbox & Tickets', 'Live Chat', 'Knowledge Base', 'Analytics'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-primary border-t-2 border-t-primary' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: Inbox & Tickets */}
      {activeTab === 'Inbox & Tickets' && (
        <div className="h-[calc(100vh-220px)] flex border border-outline-variant/30 bg-white overflow-hidden">
          {/* Inbox List (Left) */}
          <div className="w-1/3 min-w-[300px] border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Inbox ({supportTickets.filter(t => t.status !== 'Closed').length})</h2>
              <span className="material-symbols-outlined icon-sm text-on-surface-variant cursor-pointer hover:text-primary">filter_list</span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {supportTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    "p-4 border-b border-outline-variant/30 cursor-pointer transition-colors relative",
                    selectedId === ticket.id ? 'bg-white border-l-2 border-l-primary' : 'hover:bg-surface-variant/30 border-l-2 border-l-transparent'
                  )}
                >
                  {ticket.priority === 'High' && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-error" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <p className={cn("text-sm font-bold truncate pr-2", selectedId === ticket.id ? 'text-primary' : 'text-primary')}>{ticket.customer}</p>
                    <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{ticket.date}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mb-2">{ticket.subject}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 inline-block tracking-wider",
                      ticket.status === 'Open' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
                    )}>
                      {ticket.status}
                    </span>
                    
                    {ticket.status !== 'Closed' && (
                      <span className={cn("text-[9px] font-mono tracking-widest flex items-center gap-1", 
                        ticket.slaDeadline === 'Breached' ? 'text-error' : 'text-amber-600')}>
                        <span className="material-symbols-outlined text-[10px]">timer</span>
                        {ticket.slaDeadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket View (Middle) */}
          <div className="flex-1 flex flex-col bg-white border-r border-outline-variant/30">
            {selectedTicket ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-start bg-surface-container-lowest/30">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold tracking-tight text-primary">{selectedTicket.subject}</h3>
                      {selectedTicket.escalationLevel > 0 && (
                        <span className="bg-error text-white text-[9px] font-bold uppercase px-2 py-1 tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                          Tier {selectedTicket.escalationLevel + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant flex items-center gap-2">
                      <span className="font-semibold text-primary">{selectedTicket.customer}</span> 
                      &bull; {selectedTicket.id}
                      &bull; Assigned: <span className="font-mono text-primary text-xs">{selectedTicket.assignedTo}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'Closed' && (
                      <>
                        <button onClick={handleEscalate} className="px-3 py-1.5 border border-error text-error text-[10px] font-bold uppercase tracking-widest hover:bg-error/10 transition-colors">
                          Escalate
                        </button>
                        <button onClick={handleRefund} className="px-3 py-1.5 border border-primary text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors">
                          Process Refund
                        </button>
                        <button onClick={handleResolve} className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Conversation History */}
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-primary flex-shrink-0">
                          {selectedTicket.customer.charAt(0)}
                        </div>
                        <div className="bg-surface-container-lowest p-4 border border-outline-variant/30 text-sm text-primary shadow-sm rounded-r-lg rounded-bl-lg">
                          <p>Hello team, I need help with my recent order. The product arrived but it's the wrong size. How can I exchange this?</p>
                          <span className="text-[10px] text-on-surface-variant block mt-2 text-right">{selectedTicket.date}</span>
                        </div>
                      </div>
                    ) : (
                      selectedTicket.messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.sender === 'Agent' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${msg.sender === 'Agent' ? 'bg-primary text-white' : 'bg-surface-variant text-primary'}`}>
                            {msg.sender === 'Agent' ? 'A' : selectedTicket.customer.charAt(0)}
                          </div>
                          <div className={`p-4 border text-sm shadow-sm ${msg.sender === 'Agent' ? 'bg-primary/5 border-primary/20 text-primary rounded-l-lg rounded-br-lg' : 'bg-surface-container-lowest border-outline-variant/30 text-primary rounded-r-lg rounded-bl-lg'}`}>
                            <p>{msg.text}</p>
                            <span className="text-[10px] text-on-surface-variant block mt-2 text-right">{msg.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {selectedTicket.status === 'Closed' && (!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white flex-shrink-0">
                          A
                        </div>
                        <div className="bg-primary/5 p-4 border border-primary/20 text-sm text-primary shadow-sm rounded-l-lg rounded-br-lg">
                          <p>Hi {selectedTicket.customer}, we've processed your request and closed this ticket. Apologies for any inconvenience!</p>
                          <span className="text-[10px] text-on-surface-variant block mt-2 text-right">Just now</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
                  <div className="flex gap-2">
                    <textarea 
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 border border-outline-variant/50 p-3 text-sm focus:border-primary focus:outline-none resize-none bg-white"
                      disabled={selectedTicket.status === 'Closed'}
                    />
                    <button 
                      onClick={() => {
                        if (!replyText.trim()) return
                        addTicketReply(selectedTicket.id, replyText, 'Agent')
                        toast.success('Reply Sent')
                        setReplyText('')
                      }}
                      className="bg-primary text-white px-6 font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-colors disabled:opacity-50"
                      disabled={selectedTicket.status === 'Closed'}
                    >
                      Send
                    </button>
                  </div>
                </div>

                {/* Mobile Issue History */}
                <div className="lg:hidden p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
                  <h5 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Issue History</h5>
                  {customerHistory.length > 0 ? (
                    <div className="space-y-3">
                      {customerHistory.map(h => (
                        <div key={h.id} className="p-3 bg-white border border-outline-variant/30 text-xs">
                          <p className="font-semibold text-primary truncate mb-1">{h.subject}</p>
                          <div className="flex justify-between text-[10px] text-on-surface-variant">
                            <span>{h.date}</span>
                            <span>{h.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No previous tickets.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">inbox</span>
                <p className="text-sm font-semibold uppercase tracking-widest">Select a ticket</p>
              </div>
            )}
          </div>

          {/* Customer Context (Right Sidebar) */}
          <div className="w-[280px] bg-surface-container-lowest flex flex-col hidden lg:flex">
            <div className="p-4 border-b border-outline-variant/30 bg-white">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Customer Context</h3>
            </div>
            {selectedTicket ? (
              <div className="p-4 overflow-y-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-editorial text-2xl text-primary mx-auto mb-3">
                    {selectedTicket.customer.charAt(0)}
                  </div>
                  <h4 className="text-center font-bold text-primary text-sm">{selectedTicket.customer}</h4>
                  <p className="text-center text-xs text-on-surface-variant">{selectedTicket.customer.toLowerCase().replace(' ', '.')}@example.com</p>
                </div>

                <div className="mb-6">
                  <h5 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Issue History</h5>
                  {customerHistory.length > 0 ? (
                    <div className="space-y-3">
                      {customerHistory.map(h => (
                        <div key={h.id} className="p-3 bg-white border border-outline-variant/30 text-xs">
                          <p className="font-semibold text-primary truncate mb-1">{h.subject}</p>
                          <div className="flex justify-between text-[10px] text-on-surface-variant">
                            <span>{h.date}</span>
                            <span>{h.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No previous tickets.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-center">
                <p className="text-xs text-on-surface-variant">Select a ticket to view customer context.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Live Chat */}
      {activeTab === 'Live Chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {liveChats.length > 0 ? (
            <>
              {/* Chat Queue */}
              <div className="lg:col-span-1 border border-outline-variant/30 bg-white min-h-[500px] flex flex-col">
                <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Sessions</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={autoReplyEnabled}
                        onChange={() => setAutoReplyEnabled(!autoReplyEnabled)}
                      />
                      <div className="w-6 h-3 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-primary relative"></div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-primary">Auto-Reply</span>
                    </label>
                    <div className="w-px h-3 bg-outline-variant/50"></div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-700">Online</span>
                  </div>
                </div>
                <div className="divide-y divide-outline-variant/30">
                  {liveChats.map(chat => (
                    <div key={chat.id} className="p-4 hover:bg-surface-variant/20 cursor-pointer transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm text-primary">{chat.customer}</span>
                        <span className="text-[10px] text-amber-600 font-mono font-bold">{chat.waitTime} wait</span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{chat.messages[chat.messages.length - 1]?.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="lg:col-span-2 border border-outline-variant/30 bg-surface-container-lowest min-h-[500px] flex flex-col">
                <div className="p-4 border-b border-outline-variant/30 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {liveChats[0].customer.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-primary">{liveChats[0].customer}</h3>
                      <p className="text-[10px] text-on-surface-variant">Online</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
                    End Chat
                  </button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-4">
                  {liveChats[0].messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.sender === 'Agent' ? 'flex-row-reverse' : ''}`}>
                      <div className={`${msg.sender === 'Agent' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-container-lowest text-primary border border-outline-variant/30 rounded-tl-sm'} p-3 text-sm max-w-[80%] rounded-2xl`}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white border-t border-outline-variant/30">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={chatReply}
                      onChange={e => setChatReply(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSendChat()
                        }
                      }}
                      placeholder="Type a message..." 
                      className="flex-1 border border-outline-variant/50 px-4 py-2 text-sm focus:border-primary focus:outline-none" 
                    />
                    <button 
                      onClick={handleSendChat}
                      className="bg-primary text-white px-6 font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-full min-h-[400px] flex flex-col items-center justify-center border border-outline-variant/30 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-[48px] mb-4 text-on-surface-variant opacity-50">chat_bubble_outline</span>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">No Active Chats</p>
              <p className="text-xs text-on-surface-variant mt-2">The chat queue is currently empty.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Knowledge Base */}
      {activeTab === 'Knowledge Base' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Internal KB Articles */}
          <div className="bg-white border border-outline-variant/30 flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Internal Knowledge Base</h3>
                <p className="text-[9px] text-on-surface-variant mt-0.5">Agent playbooks and policies</p>
              </div>
              <button className="text-[9px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary">
                New Article
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left bg-surface-container-lowest/50">
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {kbArticles.length > 0 ? kbArticles.map(kb => (
                    <tr key={kb.id} className="hover:bg-surface-container-lowest/50 cursor-pointer">
                      <td className="p-4 font-semibold text-primary">{kb.title}</td>
                      <td className="p-4 text-xs text-on-surface-variant">{kb.category}</td>
                      <td className="p-4 text-right font-mono text-xs">{kb.views}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-xs text-on-surface-variant italic">No articles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Public FAQs */}
          <div className="bg-white border border-outline-variant/30 flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Public FAQs</h3>
                <p className="text-[9px] text-on-surface-variant mt-0.5">Manage customer-facing Help Center</p>
              </div>
              <button className="text-[9px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary">
                Add FAQ
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left bg-surface-container-lowest/50">
                    <th className="p-4">Question</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {faqs.length > 0 ? faqs.map(faq => (
                    <tr key={faq.id} className="hover:bg-surface-container-lowest/50 cursor-pointer">
                      <td className="p-4 font-semibold text-primary truncate max-w-[200px]">{faq.question}</td>
                      <td className="p-4 text-xs text-on-surface-variant">{faq.category}</td>
                      <td className="p-4 text-right">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {faq.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-xs text-on-surface-variant italic">No FAQs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Analytics */}
      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Resolution Time', value: supportAnalytics?.avgResolutionTime || 'N/A', trend: '-12%', positive: true },
              { label: 'CSAT Score', value: supportAnalytics?.csatScore || 'N/A', trend: '+0.2', positive: true },
              { label: 'Active Tickets', value: supportAnalytics?.activeTickets || 0, trend: '+5', positive: false },
              { label: 'Escalation Rate', value: supportAnalytics?.escalationRate || '0%', trend: '-0.5%', positive: true }
            ].map((kpi, i) => (
              <div key={i} className="bg-white border border-outline-variant/30 p-5 flex flex-col justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{kpi.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-editorial text-primary">{kpi.value}</span>
                  <span className={`text-[10px] font-bold ${kpi.positive ? 'text-emerald-600' : 'text-error'}`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Agent Performance Table */}
          <div className="bg-white border border-outline-variant/30 flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Agent Performance</h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left bg-surface-container-lowest/50">
                    <th className="p-4">Agent Name</th>
                    <th className="p-4">Resolved Tickets (30d)</th>
                    <th className="p-4">CSAT</th>
                    <th className="p-4 text-right">Avg Resolution Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {(supportAnalytics?.agentPerformance || []).map((agent, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest/50">
                      <td className="p-4 font-semibold text-primary">{agent.name}</td>
                      <td className="p-4 text-xs font-mono">{agent.resolved}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                          <span className="font-mono text-xs">{agent.csat}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-xs">{agent.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
