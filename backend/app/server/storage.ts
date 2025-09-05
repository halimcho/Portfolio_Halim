import {
  type User,
  type InsertUser,
  type Contact,
  type InsertContact,
  type GitHubRepo,
  type InsertGitHubRepo,
} from "../shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createContact(contact: InsertContact): Promise<Contact>;

  getGitHubRepos(): Promise<GitHubRepo[]>;
  createGitHubRepo(repo: InsertGitHubRepo): Promise<GitHubRepo>;
  clearGitHubRepos(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private contacts = new Map<string, Contact>();
  private githubRepos = new Map<string, GitHubRepo>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      subject: insertContact.subject ?? null,
      created_at: new Date().toISOString(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getGitHubRepos(): Promise<GitHubRepo[]> {
    return Array.from(this.githubRepos.values()).sort((a, b) => {
      const ta = a.updated_at ? Date.parse(a.updated_at) : -Infinity;
      const tb = b.updated_at ? Date.parse(b.updated_at) : -Infinity;
      return tb - ta;
    });
  }

  async createGitHubRepo(insertRepo: InsertGitHubRepo): Promise<GitHubRepo> {
    const id = randomUUID();
    const repo: GitHubRepo = {
      ...insertRepo,
      id,
      description: insertRepo.description ?? null,
      language: insertRepo.language ?? null,
      stars: insertRepo.stars ?? null,
      forks: insertRepo.forks ?? null,
      updated_at: insertRepo.updated_at ?? null,
    };
    this.githubRepos.set(id, repo);
    return repo;
  }

  async clearGitHubRepos(): Promise<void> {
    this.githubRepos.clear();
  }
}

export const storage = new MemStorage();
