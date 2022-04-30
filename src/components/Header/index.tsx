import styles from './header.module.scss';

export default function Header() {
  return (
    <header  className={styles.headerContainer}>
        <a href="/">
          <img src="/images/logo.svg" alt="logo" />
        </a>
    </header>

  )
}
