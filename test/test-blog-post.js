'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {runServer, app, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
   console.log('seeding data');
   const seedData = [];

   for (let i=0; i<=10; i++){
       seedData.push(generateBlogPostData());
   }
   return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
   return {
       author: {
           firstName: faker.name.firstName(),
           lastName: faker.name.lastName()
       },
       title: faker.lorem.sentence(),
       content: faker.lorem.text()
   }
}

function tearDownDb() {
   console.warn('Deleting database');
   return mongoose.connection.dropDatabase();
 }




describe('BlogPost API resource', function() {

   before(function(){
       return runServer(DATABASE_URL);
   });

   beforeEach(function(){
       return seedBlogPostData();
   });

   afterEach(function(){
       return tearDownDb();
   });

   after(function(){
       return closeServer();
   });


   describe('GET endpoint', function(){

       it('should return all existing blogs', function(){
           let res;
           return chai.request(app)
           .get('/blog-posts')
           .then(function(_res){
               res = _res;
               expect(res).to.have.status(200);
               expect(res.body.blogPosts).to.have.lengthOf.at.least(1);
               return blogPosts.count();
           })
           .then(function(count){
               expect(res.body.blogPosts).to.have.lengthOf(count);
           });
       });

       it('should return blogPosts with right field', function(){

           let resBlogPosts;
           return chai.request(app)
           .get('/blog-posts')
           .then(function(res){
               expect(res).to.have.status(200);
               expect(res).to.be.json;
               expect(res.body.blogPosts).to.be.a('array');
               expect(res.body.blogPosts).to.have.lengthOf.at.least(1);

               res.body.blogPosts.forEach(function(blogpost){
                   expect(blogpost).to.be.a('object');
                   expet(blogpost).to.include.keys('id','author','content','title','created');
               });
               resBlogPosts = res.body.blogposts[0];
               return blogPosts.findById(resBlogPosts.id);
           })
           .then(function(blogpost){

               expect(resBlogPost.title).to.equal(blogpost.title);
               expect(resBlogPost.name).to.equal(blogpost.name);
               expect(resBlogPost.content).to.equal(blogpost.content);
               expect(resBlogPost.author).to.equal.apply(blogpost.author);
           });
       });
   });

   describe('POST endpoint', function(){

    it('should add a new blog post', function(){

        const newPost = generateBlogPostData();
        
        return chai.request(app)
        .post('/blog-posts')
        .send(newPost)
        .then(function(res){
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id','title','author','content','created');
            expect(res.body.title).to.equal(newPost.title);
            expect(res.body.id).to.not.be.null;
            expect(res.body.content).to.be.equal(newPost.content);
            expect(res.body.author).to.be.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);

            return BlogPost.findById(res.body.id);
        })
        .then(function(blogpost){
            expect(blogpost.title).to.equal(newPost.name);
            expect(blogpost.content).to.equal(newPost.content);
            expect(blogpost.author.firstName).to.equal(newPost.author.firstName);
            expect(blogpost.author.lastName).to.be.equal(newPost.author.lastName);
        });
    });
   });


   describe('PUT endpoint', function(){
       it('should update fields you send over', function(){
           const updateData = {
               title: 'testTitle',
               content: 'testContent',
               author: {
                   firstName: 'authorFirst', 
                   lastName: 'authorLast'
                }
           };
       
       return BlogPost
       .findOne()
       .then(function(blogpost){
           update.id = blogpost.id;


           return chai.request(app)
           .put(`/blog-posts/${blogpost.id}`)
           .send(updateData);
       })
       .then(function(res){
           expect(res).to.have.status(204);
           return BlogPost.findById(updateData.id);
       })
       .then(function(blogpost){
           expect(blogpost.title).to.equal(updateData.title);
           expect(blogpost.content).to.equal(updateData.content);
           expect(blogpost.author.firstName).to.equal(updateData.author.firstName);
           expect(blogpost.author.lastName).to.be.equal(updateData.author.lastName);
       });
   });
});

    describe('DELETE endpoint', function(){

        it('delete a blog post by id', function(){
            let blogpost;

            return BlogPost
            .findOne()
            .then(function(_blogpost){
                blogpost = _blogpost;
                return chai.request(app).delete(`/blog-posts/${blogpost.id}`);
            })
            .then(function(res){
                expect(res).to.have.status(204);
                return BlogPost.findById(blogpost.id);
            })
            .then(function(_blogpost){
                expect(_blogpost).to.be.null;
            });
        });
    });

});