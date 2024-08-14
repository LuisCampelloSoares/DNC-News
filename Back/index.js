const express = require ('express');
const bcrypt = require('bcrypt');
const usuarioModel = require('./src/module/usuario/usuario.model')
const app = express();
const jwt = require('jsonwebtoken');
const noticiaModel = require('./src/module/noticia/noticia.model');
const cors = require('cors')

app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
    if(!req.body.email){
        return res.status(400).json({message: 'O campo email é obrigatório'});
    }
    //Validando o preenchmendo do campo de senha
    if(!req.body.senha){
        return res.status(400).json({message: 'O campo senha é obrigatório'});
    }
    const usuarioExistente = await usuarioModel.findOne({
        email: req.body.email
    });
    
    if(!usuarioExistente){
        return res.status(400).json({message: 'Usuário não está cadastrado'})
    }
    
    const senhaVerificada = bcrypt.compareSync(
        req.body.senha, usuarioExistente.senha
    );

    if(!senhaVerificada){
        return res.status(400).json({message: 'E-mail ou senha incorretos'});
    }
    const token = jwt.sign({_id: usuarioExistente._id}, 'PRMS');
    console.log(token);

    return res.status(200).json({message: 'Login realizado com sucesso'});
});


//Pegando informações do cliente em banco
app.get ('/usuarios', async (req, res)=>{
    const usuarios = await usuarioModel.find ({});
    return res.status(200).json (usuarios);
} )

//Enviando informações do cliente para banco
app.post ('/usuarios', async (req, res)=>{
    //Validando o preenchemendo do campo do Email
    if(!req.body.email){
        return res.status(400).json({message: 'O campo email é obrigatório'});
    }
    //Validando o preenchmendo do campo de senha
    if(!req.body.senha){
        return res.status(400).json({message: 'O campo senha é obrigatório'});
    }
    //Validando se o clinte já existe em banco, validação sendo feita pelo email informado pelo cliente
    const usuarioExistente = await usuarioModel.find ({email: req.body.email});

    if(usuarioExistente.length){
        return res.status(400).json({message: 'Usuario já existe'})
    }
    //Criptografando a senha do cliente, dessa forma, o envio ao banco já é criptograda
    const senhaCriptografada = bcrypt.hashSync(req.body.senha, 10);
    //A criação do cliente já pode ser feita
    const usuario =await usuarioModel.create({
        nome: req.body.nome,
        email: req.body.email,
        senha: senhaCriptografada
    })
    return res.status(201).json(usuario);
} )

app.get ('/noticias', async (req, res)=>{
    let filtroCategoria = {};
    if(req.query.categoria){
        filtroCategoria = {categoria: req.query.categoria}
    }
    const noticias = await noticiaModel.find(filtroCategoria)
    return res.status(200).json (noticias);
} )

app.post ('/noticias', async (req, res)=>{
    if(!req.body.titulo){
        return res.status(400).json({message: 'O campo titulo é obrigatório'})
    }
    if(!req.body.img){
        return res.status(400).json({message: 'O campo imagem é obrigatório'})
    }
    if(!req.body.texto){
        return res.status(400).json({message: 'O campo texto é obrigatório'})
    }
   

    const noticia = await noticiaModel.create({
        titulo: req.body.titulo,
        img: req.body.img,
        texto: req.body.texto,
        categoria: req.body.categoria

    })
    return res.status(201).json (noticia);

} )


app.listen(8080,()=>{
    console.log('Servidor funcionando na porta 8080')
})
