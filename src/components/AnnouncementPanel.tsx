import AddAnnouncementForm from './Announcements';
import AnnouncementList from './AnnouncementList';

export default function AnnouncementsPanel() {
  return (
    <div className="space-y-6">
      <AddAnnouncementForm onCreated={() => {/* optional refresh hook */ }} />
      <AnnouncementList />
    </div>
  );
}
