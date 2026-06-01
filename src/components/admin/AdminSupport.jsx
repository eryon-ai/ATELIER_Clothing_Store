import { useState } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { cn } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminSupport() {
  const { supportTickets, resolveTicket } = useAdminStore()
  const [selectedId, setSelectedId] = useState(supportTickets[0]?.id || null)

  const selectedTicket = supportTickets.find(t => t.id === selectedId)

  const handleResolve = () => {
    if (selectedId) {
      resolveTicket(selectedId)
      toast.success('Ticket marked as resolved')
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex border border-outline-variant/30 bg-white overflow-hidden">
      {/* Inbox List (Left) */}
      <div className="w-1/3 min-w-[280px] border-r border-outline-variant/30 flex flex-col bg-surface/50">
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
                "p-4 border-b border-outline-variant/30 cursor-pointer transition-colors",
                selectedId === ticket.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-variant/30 border-l-2 border-l-transparent'
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <p className={cn("text-sm font-bold truncate pr-2", selectedId === ticket.id ? 'text-primary' : 'text-primary')}>{ticket.customer}</p>
                <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{ticket.date}</span>
              </div>
              <p className="text-xs text-on-surface-variant truncate mb-2">{ticket.subject}</p>
              <span className={cn(
                "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block tracking-wider",
                ticket.status === 'Open' ? 'bg-red-100 text-red-700' :
                ticket.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
              )}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket View (Right) */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold tracking-tight text-primary">{selectedTicket.subject}</h3>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 tracking-wider",
                    selectedTicket.status === 'Open' ? 'bg-red-100 text-red-700' :
                    selectedTicket.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
                  )}>
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">From: <span className="font-semibold text-primary">{selectedTicket.customer}</span> &bull; {selectedTicket.id}</p>
              </div>
              
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-outline-variant text-xs font-semibold uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors">
                  RMA Label
                </button>
                {selectedTicket.status !== 'Closed' && (
                  <button onClick={handleResolve} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors">
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {/* Conversation History (Mocked) */}
            <div className="flex-1 p-6 overflow-y-auto bg-surface/30">
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {selectedTicket.customer.charAt(0)}
                  </div>
                  <div className="bg-white p-4 border border-outline-variant/30 text-sm text-primary shadow-sm rounded-r-lg rounded-bl-lg">
                    <p>Hello team, I need help with my recent order. The product arrived but it's the wrong size. How can I exchange this?</p>
                    <span className="text-[10px] text-on-surface-variant block mt-2 text-right">{selectedTicket.date}</span>
                  </div>
                </div>
                
                {selectedTicket.status === 'Closed' && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white flex-shrink-0">
                      A
                    </div>
                    <div className="bg-surface-variant/20 p-4 border border-outline-variant/30 text-sm text-primary shadow-sm rounded-l-lg rounded-br-lg">
                      <p>Hi {selectedTicket.customer}, we've processed your exchange and a return label has been emailed to you. Apologies for the mix-up!</p>
                      <span className="text-[10px] text-on-surface-variant block mt-2 text-right">Just now</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-outline-variant/30 bg-white">
              <div className="flex gap-2">
                <textarea 
                  rows={2}
                  placeholder="Type your reply..."
                  className="flex-1 border border-outline-variant/50 p-3 text-sm focus:border-primary focus:outline-none resize-none"
                  disabled={selectedTicket.status === 'Closed'}
                />
                <button 
                  className="bg-primary text-white px-6 font-semibold uppercase tracking-widest text-xs hover:bg-secondary transition-colors disabled:opacity-50"
                  disabled={selectedTicket.status === 'Closed'}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined icon-xl mb-4 opacity-50">inbox</span>
            <p className="text-sm font-semibold uppercase tracking-widest">Select a ticket</p>
          </div>
        )}
      </div>
    </div>
  )
}
