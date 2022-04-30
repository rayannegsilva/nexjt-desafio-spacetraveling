import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';
import { RichText } from 'prismic-dom'

import { FiCalendar, FiUser } from 'react-icons/fi';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination } : HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);


  const handleMorePosts = async (): Promise<void> => {
    const postsResponse = await fetch(nextPage).then(response =>
      response.json()
    );

    const formattedPosts = postsResponse.results.map((post): Post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: RichText.asText(post.data.title),
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(postsResponse.next_page);
    setPosts(old => [...old, ...formattedPosts]);
  };


  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
    return formattedDate;
  };



  return (
    <>
    <Head>
       <title>Home | .spacetraveling</title>
    </Head>
      <main className={commonStyles.container}>
          <Header />


        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
              <section className={styles.hero}>
              <a href="/">
                <h1>{post.data.title}</h1>
                <p className={styles.text}>{post.data.subtitle}</p>


                <div className={styles.infoContent}>
                    <div className={styles.infos}>
                      <FiCalendar  className={styles.icon}/>
                      <span className={styles.infoText}>{formattedPostDate(post.first_publication_date)}</span>
                    </div>

                    <div className={styles.infos}>
                      <FiUser className={styles.icon}/>
                      <span className={styles.infoText}>{post.data.author}</span>
                    </div>
                </div>
              </a>
          </section>
          </Link>
        ))}


        
      { nextPage &&
          <span className={styles.nextButton} onClick={handleMorePosts}>
            Carregar mais posts
          </span>}
      </main>
    </>
  
  )
} 

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
     }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
    }
  }
};
