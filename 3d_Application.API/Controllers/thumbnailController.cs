using _3d_Application.API.models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace _3d_Application.Controllers
{
    [Route("api/thumbnail")]
    [ApiController]
    public class ThumbnailController : ControllerBase
    {
        [HttpPost("save-thumbnail")]
        public async Task<IActionResult> SaveThumbnail([FromBody] ImageUploadModel thumbnailData)
        {
            try
            {
                // Vérification du chemin de sauvegarde
                var rootPath = Directory.GetCurrentDirectory();// out put dyalaha is "D:\\DotNet Core Apps\\.Net 3D PROJECT\\3d_Application\\3d_Application.API"
                var thumbnailPath = thumbnailData.Path.TrimStart('/');
                var savePath = Path.Combine(rootPath, thumbnailPath); // o hade output dyalha savePath = "/wwwroot/objImgcapture/IMG_OBJ_3.png" et thumbnailData.Path = "/wwwroot/objImgcapture/IMG_OBJ_3.png"

                // Créer le répertoire s'il n'existe pas
                var directory = Path.GetDirectoryName(savePath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Convertir base64 en bytes
                byte[] imageBytes = Convert.FromBase64String(thumbnailData.Image);

                // Sauvegarder l'image
                await System.IO.File.WriteAllBytesAsync(savePath, imageBytes);

                return Ok(new { message = "Image saved successfully", path = thumbnailData.Path });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving the image", error = ex.Message });
            }
        }
    }
}
