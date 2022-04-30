import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <header  className={styles.headerContainer}>
        <Link href="/">
          <img src="/images/logo.svg" alt="logo" />
        </Link>
    </header>

  )
}
