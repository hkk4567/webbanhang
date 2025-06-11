import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewsArticleCard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function NewsArticleCard({ article }) {
    // Component nhận vào một 'article' object làm prop
    return (
        <div className={cx('card')}>
            <Link to={`/newspage/${article.slug}`}>
                <img src={article.image} alt={article.title} className={cx('card-image')} />
            </Link>
            <div className={cx('card-body')}>
                <div className={cx('card-meta')}>
                    <span>{article.date}</span>
                </div>
                <h3 className={cx('card-title')}>
                    <Link to={`/newspage/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className={cx('card-excerpt')}>{article.excerpt}</p>
                <Link to={`/newspage/${article.slug}`} className={cx('read-more-link')}>
                    Đọc thêm <FontAwesomeIcon icon={faArrowRight} />
                </Link>
            </div>
        </div>
    );
}

export default NewsArticleCard;