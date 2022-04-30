import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import * as prismicH from '@prismicio/helpers'

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { useRouter } from 'next/router';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';

import { RichText } from 'prismic-dom'

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps): JSX.Element{


  const formattedPostDate = (date: string): string => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR
    });

    return formattedDate;
  }


  const totalWords = post.data.content.reduce((total, contentItem) => {
    if (!contentItem.heading) {
      return;
    }
    total += contentItem.heading.split(' ').length;
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const router = useRouter();

  if(router.isFallback){
    return <p>Carregando...</p>
  }


  return (

    <>
        <Head>
          <title> Space | Spacetraveling</title>
        </Head>

          <main className={styles.container}>
            <section className={commonStyles.headerPostContainer}>
                <Header />
            </section>
              
              <article>

              <div className={styles.bannerContainer}>
              <img
            className={styles.bannerContainer}
            src={post.data.banner.url}
            alt={post.data.title}
          />
              </div>
              
                <div className={styles.postContainer}>
                    <h1>{post.data?.title}</h1>
                
                        <div className={styles.infoContent}>
                            <div className={styles.infos}>
                              <FiCalendar className={styles.icon}/>
                              <span className={styles.infoText}>{formattedPostDate(post.first_publication_date)}</span>
                            </div>
                            <div  className={styles.infos}>
                              <FiUser className={styles.icon}/>
                              <span className={styles.infoText}>{post.data.author}</span>
                            </div>
                            <div  className={styles.infos}>
                              <FiClock className={styles.icon}/>
                              <span className={styles.infoText}>{readTime} min</span>
                            </div>
                          </div>
                    </div>   

                   <div className={styles.content}>
                    {post.data.content.map(content => {

                      return (
                        <div key={content.heading}>
                         <h3 className={styles.headingText}>
                            {content?.heading}
                           </h3>
                 
                    

                          <div className={styles.content} dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
                           
                
                      </div>

                      
                      )

                    })}
                      

       

                  </div>       
              </article>
          </main>
   
    </>

  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    fetch: ['posts.uid'], pageSize: 3
  });

  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: 'blocking',
  }
};

export const getStaticProps = async ({params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: RichText.asText(response.data.title), // Precisa tirar o RichText para que passe no testes.
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [... content.body],
        };
      }),
    },
  };

  console.log(response.data.banner)

  return { 
    props: { post },
  };
};
