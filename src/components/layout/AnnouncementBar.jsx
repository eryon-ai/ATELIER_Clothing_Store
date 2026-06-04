import { useAdminStore } from '../../store/useAdminStore'

export default function AnnouncementBar() {
  const cms = useAdminStore(s => s.storefrontCMS)

  if (!cms?.announcement?.active) return null

  return (
    <div className="bg-[#111111] text-white py-2.5 px-4 text-center overflow-hidden h-[40px] flex items-center justify-center relative z-[60]">
      <p className="text-[11px] font-medium tracking-wide whitespace-nowrap">
        {cms.announcement.link ? (
          <>
            {cms.announcement.text.replace('Sign Up Now', '').trim()}{' '}
            <a href={cms.announcement.link} className="underline font-semibold hover:opacity-80 transition-opacity">
              Sign Up Now
            </a>
          </>
        ) : (
          cms.announcement.text
        )}
      </p>
    </div>
  )
}
