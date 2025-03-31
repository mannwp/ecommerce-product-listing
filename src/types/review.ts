import { Timestamp } from 'firebase/firestore'

export interface Review {
  id: string
  userId: string
  email: string
  rating: number
  reviewText: string
  createdAt: Timestamp
}
