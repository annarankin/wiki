-- SELECT DISTINCT title, categories.id AS category_id, articles.id AS article_id, category FROM tags, articles, categories WHERE articles.id=tags.article_id AND title LIKE '%"+query+"%' OR categories.id=tags.category_id AND category LIKE '%"+query+"%' GROUP BY article_id, category_id;

-- SELECT DISTINCT title, categories.id AS category_id, article_id, category FROM tags, articles, categories WHERE category LIKE '%" + query + "%' AND tags.article_id=articles.id AND categories.id=category_id;

--working title & category query
SELECT DISTINCT title, categories.id AS category_id, article_id, category FROM tags, articles, categories WHERE category LIKE '%" + query + "%' AND tags.article_id=articles.id AND categories.id=category_id OR title LIKE '%" + query + "%' AND tags.article_id=articles.id AND categories.id=category_id GROUP BY article_id;

--find and delete categories without article associations
-- SELECT DISTINCT title, category_id, article_id, category, categories.id AS catID FROM tags, articles, categories WHERE tags.article_id=articles.id AND categories.id!=category_id;



-- SELECT EXISTS(SELECT * FROM tags WHERE category_id=" + category_id + "); --returns 0 if category_id is not present

-- SELECT *
-- FROM tags
--     LEFT JOIN categories ON tags.category_id = categories.id
-- WHERE tags.category_id IS NULL;

-- SELECT *
-- FROM categories
-- WHERE id NOT
-- IN (
--     SELECT DISTINCT categories.id
--     FROM tags 
--     INNER JOIN categories id
--     USING ( id )
-- );

--it werks!!
DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM tags);