    var mongoose = require('mongoose');
    //var Item = require('../models/item');
    var Occurrence = require('../models/occurrence');//new occurence file
    var itemRESTController = {};
    var User = require('../models/user'); // já deve existir ou adiciona esta linha

    // mostra todos items
    /*itemRESTController.showAll = async function(req, res,next){
        try {
            const dbitems = await Item.find({})
            console.log(dbitems);
            res.json(dbitems);
        } catch(err){
            console.log('Erro ao ler da base de dados');
            next(err);
        }
    }

    // mostra 1 item por id
    itemRESTController.show = async function(req, res,next){
        try {
            const dbitems = await Item.findOne({_id:req.params.id})
            console.log(dbitems);
            res.json(dbitems);
        } catch(err){
            console.log('Erro ao ler da base de dados');
            next(err);
        }
    }

    // cria 1 item como resposta a um post de um form
    itemRESTController.create = async function(req,res,next){
        try {
            var item = new Item(req.body);
            const itemSaved = await item.save()
            console.log(itemSaved);
            res.json(itemSaved);
        } catch(err){
            console.log('Erro ao gravar da base de dados');
            next(err);
        }
    }

    // edita 1 item como resposta a um post de um form editar
    itemRESTController.edit = async function(req,res,next){
        try {
            const editedItem = await Item.findByIdAndUpdate(req.body._id, req.body, { new: true } )
            console.log(editedItem);
            res.json(editedItem);
        } catch(err){
            console.log('Erro ao atualizar na base de dados');
            next(err);
        }
    }

    // elimina 1 item
    itemRESTController.delete = async function(req, res,next){
        try {
            const deleteItem = await Item.findByIdAndDelete({_id:req.params.id})
            console.log(deleteItem);
            res.json(deleteItem);
        } catch(err){
            console.log('Erro ao remover da base de dados');
            next(err);
        }
    }
    */

    // [US#20] Create Occurrence
    itemRESTController.createOccurrence = async function(req, res, next){
        try {
            const { title, description, category, location, photoUrl, userId } = req.body;

            if (!description || !category || !location || !photoUrl) {
                return res.status(400).json({
                    message: 'All required fields must be filled.'
                });
            }

            const newOccurrence = new Occurrence({
                title,
                description,
                category,
                location,
                photoUrl,
                status: "PENDING",
                userId: userId || req.userId //testing
            });

            const savedOccurrence = await newOccurrence.save();
            res.status(201).json(savedOccurrence);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // [US#22] Get My Occurrences
    itemRESTController.getMyOccurrences = async function(req, res, next){
        try {
            const userId = req.userId; // Testing
            const occurrences = await Occurrence.find({ userId: userId }).sort({ createdAt: -1 });
            res.json(occurrences);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};
    // [US#XX] Add Comment to Occurrence
    itemRESTController.addComment = async function(req, res, next) {
        try {
            const { text } = req.body;
            const authorId = req.user.id; // vem do token JWT

            // Validação: campo vazio
            if (!text || text.trim() === '') {
                return res.status(400).json({ message: 'Comment cannot be empty.' });
            }

            // Vai buscar o nome do utilizador à BD
            const user = await User.findById(authorId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const occurrence = await Occurrence.findById(req.params.id);
            if (!occurrence) {
                return res.status(404).json({ message: 'Occurrence not found.' });
            }

            const newComment = {
                text: text.trim(),
                authorId,
                authorName: user.name, // nome vindo da BD
                createdAt: new Date()
            };

            occurrence.comments.push(newComment);
            await occurrence.save();

            res.status(201).json(occurrence.comments[occurrence.comments.length - 1]);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // [US#XX] Delete Comment from Occurrence
    itemRESTController.deleteComment = async function(req, res, next) {
        try {
            const { id, commentId } = req.params;
            const requestingUserId = req.user.id;
            const requestingUserRole = req.user.role; // assumindo que o middleware coloca o role

            const occurrence = await Occurrence.findById(id);
            if (!occurrence) {
                return res.status(404).json({ message: 'Occurrence not found.' });
            }

            const comment = occurrence.comments.id(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found.' });
            }

            const isAuthor = comment.authorId.toString() === requestingUserId.toString();
            const isAdmin = requestingUserRole === 'Admin';

            // Só o autor ou um admin podem apagar
            if (!isAuthor && !isAdmin) {
                return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
            }

            occurrence.comments.pull(commentId);
            await occurrence.save();

            res.status(200).json({ message: 'Comment deleted successfully.' });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
module.exports = itemRESTController;