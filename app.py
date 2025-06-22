from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import random

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'DataBase.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    src = db.Column(db.String, nullable=False)
    likes = db.Column(db.Integer)
    description = db.Column(db.String)
    effect = db.Column(db.String)


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    comment_text = db.Column(db.String)
    photo_id = db.Column(db.Integer, db.ForeignKey('photo.id'))


class DefaultComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)


class DefaultDescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)


def initialize_default_data():
    default_comments = [
        'Цей кадр нереально крутий! :)',
        'Ти вмієш дивувати! Кожен кадр - поєднання життєлюбності і краси',
        'Спинися мить, прекрасна ти!',
        'Просто супер! Як тобі це вдається?',
        'Це прото шедевр мистецтва',
        'В цьому штучному світі так приємно знайти щось натуральне))',
        'Клас!!!))',
        'Нереально чудово!',
        'А ти вмієш дивувати ;)',
        'Це фото так і проситься в рамочку на стіну'
    ]

    for comment in default_comments:
        if not DefaultComment.query.filter_by(text=comment).first():
            db.session.add(DefaultComment(text=comment))

    default_descriptions = [
        'Коли радості немає меж',
        'Любов в кожному пікселі',
        'Фото заряджене позитивом',
        'Зловив дзен',
        'Як мало потрібно для щастя',
        'Знали б ви що в мене на умі! ;)',
        'Show must go on',
        'Good vibes only',
        'My inspiration',
        'On my way to paradise',
        'Що це, якщо не любов? Х)'
    ]

    for desc in default_descriptions:
        if not DefaultDescription.query.filter_by(text=desc).first():
            db.session.add(DefaultDescription(text=desc))

    db.session.commit()


def add_more_photos_and_comments():
    all_descriptions = [d.text for d in DefaultDescription.query.all()]
    all_comments = [c.text for c in DefaultComment.query.all()]
    for i in range(26):
        description = random.choice(all_descriptions)
        photo = Photo(
            src=f'../static/img/{i}.jpg',
            likes=random.randint(0, 100),
            description=description,
            effect='none(0%)'
        )
        db.session.add(photo)
        db.session.commit()
        comments_count = random.randint(0, 3)
        for _ in range(comments_count):
            comment = Comment(
                comment_text=random.choice(all_comments),
                photo_id=photo.id
            )
            db.session.add(comment)

    db.session.commit()


@app.route('/')
def index():
    all_comments = [c.text for c in DefaultComment.query.all()]
    all_descriptions = [d.text for d in DefaultDescription.query.all()]
    pictures_db = generate_picture_db(26, all_comments, all_descriptions)
    return render_template('index.html', pictures_db=pictures_db)


def get_random_element(array):
    return random.choice(array)


def generate_picture_db(amount, all_comments, all_descriptions):
    pictures = []
    for i in range(amount):
        comments = []
        comments_count = random.randint(0, 3)
        for _ in range(comments_count):
            comments.append(get_random_element(all_comments))

        picture = {
            'src': f'../static/img/{i}.jpg',
            'likes': random.randint(0, 100),
            'comments': comments,
            'comments_number': len(comments),
            'effect': 'none(0%)',
            'description': get_random_element(all_descriptions)
        }
        pictures.append(picture)
    return pictures


@app.route('/api/photos/all')
def getPhotos():
    allPhotos = db.session.query(Photo).all()
    photos_dict = []
    for photo in allPhotos:
        photos_dict.append({
            'id': photo.id,
            'src': photo.src,
            'description': photo.description,
            'likes': photo.likes,
            'effect': photo.effect,
            'commentsNumber': db.session.query(Comment).filter_by(photo_id=photo.id).count()
        })
    return jsonify(photos_dict)


@app.route('/api/photos/<int:photo_id>')
def get_photo_with_comments(photo_id):
    photo = db.session.query(Photo).all(photo_id)
    if not photo:
        return jsonify({'error': 'Photo not found'}), 404
    comments = db.session.query(Comment).filter_by(photo_id=photo_id).count()
    response = {
        'id': photo.id,
        'src': photo.src,
        'likes': photo.likes,
        'description': photo.description,
        'effect': photo.effect,
        'comments': [comment.comment_text for comment in comments],
        'comments_count': len(comments)
    }

    return jsonify(response)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        initialize_default_data()
        add_more_photos_and_comments()
    app.run()