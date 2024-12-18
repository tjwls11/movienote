import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

let isConnected = false
let client: MongoClient | null = null

// Mongoose 연결 (메모 등 mongoose 모델을 사용하는 기능용)
export async function connectMongoDB() {
  try {
    if (isConnected) {
      console.log('이미 MongoDB에 연결되어 있습니다.')
      return
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI가 .env 파일에 없습니다')
    }

    await mongoose.connect(process.env.MONGODB_URI as string)
    isConnected = true
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
    throw error
  }
}

// MongoClient 연결 (auth 등 native driver가 필요한 기능용)
export async function connectToDatabase() {
  try {
    if (client) {
      return client.db('movienote')
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI가 .env 파일에 없습니다')
    }

    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    console.log('MongoDB(Native)에 연결되었습니다')

    return client.db('movienote')
  } catch (error) {
    console.error('MongoDB Native 연결 에러:', error)
    throw error
  }
}

// 데이터베이스 접근용 헬퍼 함수
export function getDatabase() {
  if (!isConnected) {
    throw new Error('MongoDB에 먼저 연결해야 합니다')
  }
  return mongoose.connection.db
}

export default connectMongoDB
