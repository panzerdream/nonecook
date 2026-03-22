const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 用户相关操作
const userOperations = {
  // 创建用户并自动创建专属家庭
  createUser: async (event) => {
    const { nickname, avatar, familyId } = event.data;
    
    // 必填字段验证
    if (!nickname) {
      return { success: false, error: "用户昵称不能为空" };
    }
    
    try {
      // 创建用户
      const userResult = await db.collection("users").add({
        data: {
          nickname,
          avatar: avatar || "",
          familyId: familyId || null,
          createdAt: new Date()
        }
      });
      
      const userId = userResult._id;
      
      // 如果没有指定家庭，创建专属家庭
      if (!familyId) {
        const familyName = `${nickname}的专属家庭`;
        
        // 创建专属家庭
        const familyResult = await db.collection("families").add({
          data: {
            name: familyName,
            members: [
              {
                userId: userId,
                role: "管理员",
                joinedAt: new Date()
              }
            ],
            createdAt: new Date()
          }
        });
        
        // 更新用户的家庭ID
        await db.collection("users").doc(userId).update({
          data: {
            familyId: familyResult._id
          }
        });
        
        return { success: true, data: { user: userResult, family: familyResult } };
      }
      
      return { success: true, data: { user: userResult } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 获取用户信息
  getUserInfo: async (event) => {
    const { userId } = event;
    
    if (!userId) {
      return { success: false, error: "用户ID不能为空" };
    }
    
    try {
      const result = await db.collection("users").doc(userId).get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 更新用户信息
  updateUser: async (event) => {
    const { userId, data } = event;
    
    if (!userId) {
      return { success: false, error: "用户ID不能为空" };
    }
    
    try {
      const result = await db.collection("users").doc(userId).update({
        data: data
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 确保用户有家庭，如果没有则创建专属家庭
  ensureUserHasFamily: async (event) => {
    const { userId } = event;
    
    if (!userId) {
      return { success: false, error: "用户ID不能为空" };
    }
    
    try {
      // 获取用户信息
      const user = await db.collection("users").doc(userId).get();
      if (!user.data) {
        return { success: false, error: "用户不存在" };
      }
      
      // 如果用户没有家庭，创建专属家庭
      if (!user.data.familyId) {
        const familyName = `${user.data.nickname || '用户'}的专属家庭`;
        
        // 创建专属家庭
        const familyResult = await db.collection("families").add({
          data: {
            name: familyName,
            members: [
              {
                userId: userId,
                role: "管理员",
                joinedAt: new Date()
              }
            ],
            createdAt: new Date()
          }
        });
        
        // 更新用户的家庭ID
        await db.collection("users").doc(userId).update({
          data: {
            familyId: familyResult._id
          }
        });
        
        return { success: true, data: { family: familyResult, created: true } };
      }
      
      return { success: true, data: { created: false } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 家庭相关操作
const familyOperations = {
  // 创建家庭
  createFamily: async (event) => {
    const { name, creatorId } = event.data;
    
    if (!name) {
      return { success: false, error: "家庭名称不能为空" };
    }
    
    if (!creatorId) {
      return { success: false, error: "创建者ID不能为空" };
    }
    
    try {
      // 创建家庭
      const familyResult = await db.collection("families").add({
        data: {
          name,
          members: [
            {
              userId: creatorId,
              role: "管理员",
              joinedAt: new Date()
            }
          ],
          createdAt: new Date()
        }
      });
      
      // 更新用户的家庭ID
      await db.collection("users").doc(creatorId).update({
        data: {
          familyId: familyResult._id
        }
      });
      
      return { success: true, data: familyResult };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 获取家庭信息
  getFamilyInfo: async (event) => {
    const { familyId } = event;
    
    if (!familyId) {
      return { success: false, error: "家庭ID不能为空" };
    }
    
    try {
      const result = await db.collection("families").doc(familyId).get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 添加家庭成员（支持菜谱导入）
  addFamilyMember: async (event) => {
    const { familyId, userId, role = "成员", importRecipes = false } = event.data;
    
    if (!familyId || !userId) {
      return { success: false, error: "家庭ID和用户ID不能为空" };
    }
    
    try {
      // 获取用户信息，检查用户之前的家庭ID
      const user = await db.collection("users").doc(userId).get();
      const oldFamilyId = user.data.familyId;
      
      // 检查用户是否已在家庭中
      const family = await db.collection("families").doc(familyId).get();
      if (family.data.members.some(member => member.userId === userId)) {
        return { success: false, error: "用户已在该家庭中" };
      }
      
      // 添加成员到新家庭
      await db.collection("families").doc(familyId).update({
        data: {
          members: db.command.push({
            userId,
            role,
            joinedAt: new Date()
          })
        }
      });
      
      // 更新用户的家庭ID
      await db.collection("users").doc(userId).update({
        data: {
          familyId
        }
      });
      
      // 如果需要导入菜谱，且用户之前有家庭
      if (importRecipes && oldFamilyId && oldFamilyId !== familyId) {
        // 获取用户在旧家庭中的所有菜谱
        const userRecipes = await db.collection("recipes")
          .where({
            familyId: oldFamilyId,
            creatorId: userId
          })
          .get();
        
        // 将菜谱导入新家庭
        if (userRecipes.data.length > 0) {
          for (const recipe of userRecipes.data) {
            // 创建新的菜谱记录，修改家庭ID
            const newRecipeData = {
              ...recipe,
              familyId: familyId,
              _id: undefined // 移除旧ID，让系统生成新ID
            };
            delete newRecipeData._id;
            
            await db.collection("recipes").add({
              data: newRecipeData
            });
          }
        }
      }
      
      return { success: true, data: { message: "加入家庭成功" } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 退出家庭
  leaveFamily: async (event) => {
    const { userId, familyId } = event;
    
    if (!userId || !familyId) {
      return { success: false, error: "用户ID和家庭ID不能为空" };
    }
    
    try {
      // 从家庭中移除成员
      await db.collection("families").doc(familyId).update({
        data: {
          members: db.command.pull({
            userId: userId
          })
        }
      });
      
      // 更新用户的家庭ID为null
      await db.collection("users").doc(userId).update({
        data: {
          familyId: null
        }
      });
      
      return { success: true, data: { message: "退出家庭成功" } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 食材相关操作
const ingredientOperations = {
  // 添加食材（自动确保用户有家庭）
  addIngredient: async (event) => {
    const { name, quantity, unit, type, expiryDate, uploaderId, familyId } = event.data;
    
    // 必填字段验证
    if (!name) {
      return { success: false, error: "食材名称不能为空" };
    }
    
    if (!quantity || quantity <= 0) {
      return { success: false, error: "数量必须大于0" };
    }
    
    if (!unit) {
      return { success: false, error: "单位不能为空" };
    }
    
    if (!type) {
      return { success: false, error: "食材类型不能为空" };
    }
    
    if (!uploaderId) {
      return { success: false, error: "上传者ID不能为空" };
    }
    
    try {
      let finalFamilyId = familyId;
      
      // 如果没有提供家庭ID，获取用户的家庭ID
      if (!finalFamilyId) {
        const user = await db.collection("users").doc(uploaderId).get();
        if (!user.data) {
          return { success: false, error: "用户不存在" };
        }
        finalFamilyId = user.data.familyId;
        
        // 如果用户没有家庭，创建专属家庭
        if (!finalFamilyId) {
          const familyName = `${user.data.nickname || '用户'}的专属家庭`;
          
          // 创建专属家庭
          const familyResult = await db.collection("families").add({
            data: {
              name: familyName,
              members: [
                {
                  userId: uploaderId,
                  role: "管理员",
                  joinedAt: new Date()
                }
              ],
              createdAt: new Date()
            }
          });
          
          // 更新用户的家庭ID
          await db.collection("users").doc(uploaderId).update({
            data: {
              familyId: familyResult._id
            }
          });
          
          finalFamilyId = familyResult._id;
        }
      }
      
      const result = await db.collection("ingredients").add({
        data: {
          name,
          quantity: Number(quantity),
          unit,
          type,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          uploaderId,
          familyId: finalFamilyId,
          createdAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 获取家庭食材列表
  getFamilyIngredients: async (event) => {
    const { familyId } = event;
    
    if (!familyId) {
      return { success: false, error: "家庭ID不能为空" };
    }
    
    try {
      const result = await db.collection("ingredients")
        .where({ familyId })
        .orderBy("createdAt", "desc")
        .get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 更新食材
  updateIngredient: async (event) => {
    const { ingredientId, data } = event;
    
    if (!ingredientId) {
      return { success: false, error: "食材ID不能为空" };
    }
    
    try {
      const result = await db.collection("ingredients").doc(ingredientId).update({
        data: data
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 删除食材
  deleteIngredient: async (event) => {
    const { ingredientId } = event;
    
    if (!ingredientId) {
      return { success: false, error: "食材ID不能为空" };
    }
    
    try {
      const result = await db.collection("ingredients").doc(ingredientId).remove();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 食谱相关操作
const recipeOperations = {
  // 添加食谱（自动确保用户有家庭）
  addRecipe: async (event) => {
    const { name, image, notes, ingredients, familyId, creatorId } = event.data;
    
    // 必填字段验证
    if (!name) {
      return { success: false, error: "食谱名称不能为空" };
    }
    
    if (!creatorId) {
      return { success: false, error: "创建者ID不能为空" };
    }
    
    try {
      let finalFamilyId = familyId;
      
      // 如果没有提供家庭ID，获取用户的家庭ID
      if (!finalFamilyId) {
        const user = await db.collection("users").doc(creatorId).get();
        if (!user.data) {
          return { success: false, error: "用户不存在" };
        }
        finalFamilyId = user.data.familyId;
        
        // 如果用户没有家庭，创建专属家庭
        if (!finalFamilyId) {
          const familyName = `${user.data.nickname || '用户'}的专属家庭`;
          
          // 创建专属家庭
          const familyResult = await db.collection("families").add({
            data: {
              name: familyName,
              members: [
                {
                  userId: creatorId,
                  role: "管理员",
                  joinedAt: new Date()
                }
              ],
              createdAt: new Date()
            }
          });
          
          // 更新用户的家庭ID
          await db.collection("users").doc(creatorId).update({
            data: {
              familyId: familyResult._id
            }
          });
          
          finalFamilyId = familyResult._id;
        }
      }
      
      const result = await db.collection("recipes").add({
        data: {
          name,
          image: image || "",
          notes: notes || "",
          ingredients: ingredients || [],
          familyId: finalFamilyId,
          creatorId,
          createdAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 获取家庭食谱列表
  getFamilyRecipes: async (event) => {
    const { familyId } = event;
    
    if (!familyId) {
      return { success: false, error: "家庭ID不能为空" };
    }
    
    try {
      const result = await db.collection("recipes")
        .where({ familyId })
        .orderBy("createdAt", "desc")
        .get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 获取食谱详情
  getRecipeDetail: async (event) => {
    const { recipeId } = event;
    
    if (!recipeId) {
      return { success: false, error: "食谱ID不能为空" };
    }
    
    try {
      const result = await db.collection("recipes").doc(recipeId).get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 更新食谱
  updateRecipe: async (event) => {
    const { recipeId, data } = event;
    
    if (!recipeId) {
      return { success: false, error: "食谱ID不能为空" };
    }
    
    try {
      const result = await db.collection("recipes").doc(recipeId).update({
        data: data
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 删除食谱
  deleteRecipe: async (event) => {
    const { recipeId } = event;
    
    if (!recipeId) {
      return { success: false, error: "食谱ID不能为空" };
    }
    
    try {
      const result = await db.collection("recipes").doc(recipeId).remove();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // 推荐食谱（基于现有食材）
  recommendRecipes: async (event) => {
    const { familyId } = event;
    
    if (!familyId) {
      return { success: false, error: "家庭ID不能为空" };
    }
    
    try {
      // 获取家庭所有食材
      const ingredientsResult = await db.collection("ingredients")
        .where({ familyId })
        .get();
      
      const availableIngredients = ingredientsResult.data;
      
      // 获取所有食谱
      const recipesResult = await db.collection("recipes")
        .where({ familyId })
        .get();
      
      const allRecipes = recipesResult.data;
      
      // 匹配逻辑：找出可以用现有食材制作的食谱
      const recommendedRecipes = allRecipes.filter(recipe => {
        // 如果食谱没有食材要求，直接推荐
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          return true;
        }
        
        // 检查食谱所需的每种食材是否都有足够的数量
        return recipe.ingredients.every(recipeIngredient => {
          const availableIngredient = availableIngredients.find(ing => 
            ing.name === recipeIngredient.name
          );
          
          return availableIngredient && 
                 availableIngredient.quantity >= recipeIngredient.quantity;
        });
      });
      
      return { success: true, data: recommendedRecipes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 数据库初始化
const initDatabase = async () => {
  try {
    // 创建集合
    await db.createCollection("users");
    await db.createCollection("families");
    await db.createCollection("recipes");
    await db.createCollection("ingredients");
    return { success: true, message: "数据库初始化成功" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  const { module, action } = event;
  
  switch (module) {
    case "user":
      return userOperations[action]?.(event);
    
    case "family":
      return familyOperations[action]?.(event);
    
    case "ingredient":
      return ingredientOperations[action]?.(event);
    
    case "recipe":
      return recipeOperations[action]?.(event);
    
    case "init":
      return initDatabase();
    
    default:
      return { success: false, error: "未知模块" };
  }
};