import mongoose, {Model, Schema} from 'mongoose';

export interface IPost extends Document {
    _id: Schema.Types.ObjectId;
    title: string;
    content: string;
    author: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A title is required for a post']
    },
    content: {
        type: String,
        required: [true, 'Content is required for a post']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

let Post: Model<IPost>;

if (mongoose.models.Post) {
    Post = mongoose.model<IPost>('Post');
} else {
    Post = mongoose.model<IPost>('Post', postSchema);
}

export default Post;
