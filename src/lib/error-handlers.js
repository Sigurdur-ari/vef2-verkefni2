export function handle404Error(req, res){
    const message = "Síða fannst ekki";
    return res.status(404).render('error', {message});
}

export function handleError(err, req, res, next) {
    console.error('error occured', err, next);
    const templateData = { title: 'Villa kom upp' };
  
    return res.status(500).render('error', templateData);
  }