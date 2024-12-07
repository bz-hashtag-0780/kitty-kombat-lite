import SMSOTP from '@/components/magic/auth/SMSOTP';
import { UserInfo } from '@/components/magic/UserInfo';
// import { PlayPage } from '@/components/PlayPage/PlayPage';

export default function Home() {
	return (
		<div>
			<SMSOTP />
			<UserInfo />
		</div>
	);
}
