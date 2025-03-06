import JobCard from './JobCard';
import TelegramMessageCard from './TelegramMessageCard';

export default function MixedContentCard({ item, type }) {
  if (type === 'job') {
    return <JobCard job={item} />;
  } else if (type === 'telegram') {
    return <TelegramMessageCard message={item} />;
  }
  return null;
} 